const Order = require('../models/order.model'); // Ajusta la ruta según tu estructura

exports.saga_improvment = async (req, res) => {
    let order = null;
    let payment = null;
    let paymentClientSecret = null;
    let paymentids = null;

    try {
        const incomingAmount = req.body?.amount;
        const incomingItems = req.body?.items;
        const username = req.body?.username || null;

        if (!incomingAmount || !incomingItems) {
            return res.status(400).json({ message: 'Amount and items are required' });
        }

        const orderData = {
            username: username,
            amount: incomingAmount,
            status: 'PENDING',
            items: incomingItems.map(item => ({
                id_evento: item.id_evento,
                cantidad: item.cantidad,
                merchant: item.merchant || [] // merchant es un array como dijiste
            }))
        };

        // Creamos orden en status PENDING
        order = await Order.create(orderData);

        const token =
            (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
            process.env.PRISMA_SECRET ||
            null;
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const amountInCents = typeof incomingAmount === 'number'
            ? Math.round(incomingAmount * 100)
            : Math.round(parseFloat(incomingAmount) * 100);

        // 1) reservar inventario de eventos
        await retry(() =>
            postJson('http://prisma:3002/eventos/reserve-inventory/', {
                orderId: order._id,
                items: order.items
            }, authHeader), 4, 300);

        // 2) reservar inventario de merchant (llamada al endpoint que indicaste)
        try {
            await retry(() =>
                postJson('http://localhost:3002/merch/reserve-inventory', {
                    orderId: order._id,
                    items: order.items
                }, authHeader), 4, 300);
        } catch (errMerchReserve) {
            // Si falla la reserva del merchant, compensamos la reserva de eventos
            console.error('Merchant reserve failed, attempting to release events reservation:', errMerchReserve);
            try {
                await retry(() =>
                    postJson('http://localhost:3002/eventos/release-inventory', {
                        orderId: order._id,
                        items: order.items
                    }, authHeader), 3, 300);
            } catch (compErr) {
                console.error('Error liberando inventario de eventos tras fallo merchant reserve:', compErr);
            }

            // Marcamos orden como FAILED y devolvemos error
            order.status = 'FAILED';
            await order.save();

            return res.status(500).json({
                message: 'Merchant reservation failed, events reservation rolled back',
                error: errMerchReserve?.message || String(errMerchReserve),
                orderId: order._id
            });
        }

        // 3) procesar pago -> esperamos { clientSecret, paymentId }
        payment = await retry(() =>
            postJson('http://prisma:3002/process-payment', {
                orderId: order._id,
                amount: amountInCents
            }, authHeader), 4, 300);

        // extraemos únicamente el client secret (si está)
        paymentClientSecret = payment?.clientSecret ?? null;
        paymentids = payment?.paymentId ?? null;
        order.status = 'SHAVED';
        await order.save();

        // RESPUESTA EXITOSA: devolvemos solo el clientSecret (y el order)
        return res.status(201).json({
            message: 'Order completed successfully',
            order,
            clientSecret: paymentClientSecret,
            paymentids
        });

    } catch (error) {
        console.error('Saga failed:', error);

        // Intentar localizar la orden a compensar (si existe)
        let orderToCompensate = null;

        if (req.body?.tempOrderId || error.orderId) {
            orderToCompensate = await Order.findById(req.body.tempOrderId || error.orderId);
        } else if (order && order._id) {
            orderToCompensate = order;
        }

        const token =
            (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) ||
            process.env.PRISMA_SECRET ||
            null;
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        if (orderToCompensate) {
            // Intentamos liberar tanto eventos como merchant (si corresponde)
            try {
                // Liberar inventario de eventos
                await retry(() =>
                    postJson('http://prisma:3002/eventos/release-inventory/', {
                        orderId: orderToCompensate._id,
                        items: orderToCompensate.items // si tu endpoint acepta solo orderId, también funcionará si lo maneja
                    }, authHeader), 3, 300);
            } catch (compErr) {
                console.error('Error al liberar inventario de eventos (compensación):', compErr);
            }

            try {
                // Liberar inventario de merchant
                await retry(() =>
                    postJson('http://localhost:3002/merch/release-inventory', {
                        orderId: orderToCompensate._id,
                        items: orderToCompensate.items
                    }, authHeader), 3, 300);
            } catch (compErr) {
                console.error('Error al liberar inventario de merchant (compensación):', compErr);
            }

            // marcar orden como FAILED
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
        // si la API responde JSON con error, intentamos parsearlo para mayor info
        let bodyText = errorText;
        try {
            const parsed = JSON.parse(errorText);
            bodyText = parsed.message || parsed.error || JSON.stringify(parsed);
        } catch (e) {
            // ignore parse error
        }
        throw new Error(`HTTP ${response.status}: ${bodyText}`);
    }

    return response.json();
}
