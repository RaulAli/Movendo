const Order = require('../models/order.model'); // Ajusta la ruta según tu estructura

exports.saga_improvment = async (req, res) => {
    let order = null;
    let payment = null;           // Aquí guardaremos la respuesta completa del servicio de pago
    let paymentClientSecret = null; // Aquí guardamos sólo el client secret (si existe)

    try {
        const incomingAmount = req.body?.amount;
        const incomingItems = req.body?.items;
        const userId = req.body?.userId || null;

        if (!incomingAmount || !incomingItems) {
            return res.status(400).json({ message: 'Amount and items are required' });
        }

        const orderData = {
            userid: userId,
            amount: incomingAmount,
            status: 'PENDING',
            items: incomingItems.map(item => ({
                id_evento: item.id_evento,
                cantidad: item.cantidad,
                merchant: { id_merchant: item.merchant?.id_merchant || null }
            }))
        };

        order = await Order.create(orderData);

        const token =
            (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
            process.env.PRISMA_SECRET ||
            null;
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const amountInCents = typeof incomingAmount === 'number'
            ? Math.round(incomingAmount * 100)
            : Math.round(parseFloat(incomingAmount) * 100);

        // reservar inventario
        await retry(() =>
            postJson('http://localhost:3002/eventos/reserve-inventory/', {
                orderId: order._id,
                items: order.items
            }, authHeader), 4, 300);

        // procesar pago -> esperamos { clientSecret, paymentId }
        payment = await retry(() =>
            postJson('http://localhost:3002/process-payment', {
                orderId: order._id,
                amount: amountInCents
            }, authHeader), 4, 300);

        // extraemos únicamente el client secret (si está)
        paymentClientSecret = payment?.clientSecret ?? payment?.client_secret ?? null;

        order.status = 'SHAVED';
        await order.save();

        // RESPUESTA EXITOSA: devolvemos solo el clientSecret (y el order)
        return res.status(201).json({
            message: 'Order completed successfully',
            order,
            clientSecret: paymentClientSecret
        });

    } catch (error) {
        console.error('Saga failed:', error);

        let orderToCompensate = null;

        if (req.body?.tempOrderId || error.orderId) {
            orderToCompensate = await Order.findById(req.body.tempOrderId || error.orderId);
        }

        if (orderToCompensate) {
            try {
                const token =
                    (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
                    process.env.PRISMA_SECRET ||
                    null;
                const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

                await retry(() =>
                    postJson('http://localhost:3002/eventos/release-inventory/', {
                        orderId: orderToCompensate._id
                    }, authHeader), 3, 300);
            } catch (compErr) {
                console.error('Error al liberar inventario (compensación):', compErr);
            }

            orderToCompensate.status = 'FAILED';
            await orderToCompensate.save();
        }

        // si payment fue seteado parcialmente, intentar extraer client secret
        if (!paymentClientSecret) {
            paymentClientSecret = payment?.clientSecret ?? payment?.client_secret ?? null;
        }

        // RESPUESTA DE ERROR: devolvemos solo clientSecret (si existe) y el orderId afectado
        return res.status(500).json({
            message: 'Order failed',
            error: error?.message || 'Unknown error',
            orderId: orderToCompensate?._id || order?._id || null,
            clientSecret: paymentClientSecret // puede ser null si no se creó el paymentIntent
        });
    }
};



// Función auxiliar para reintentos (si no la tienes ya)
async function retry(fn, retries = 3, delay = 300) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay);
    }
}

// Función auxiliar para POST (si no la tienes ya)
async function postJson(url, data, headers = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
}