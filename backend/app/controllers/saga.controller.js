const Order = require('../models/order.model'); // Ajusta la ruta según tu estructura

exports.saga_improvment = async (req, res) => {
    try {
        const incomingAmount = req.body?.amount;
        const incomingItems = req.body?.items;
        const userId = req.body?.userId || null;

        if (!incomingAmount || !incomingItems) {
            return res.status(400).json({
                message: 'Amount and items are required'
            });
        }

        const orderData = {
            userid: userId,
            amount: incomingAmount,
            status: 'PENDING',
            items: incomingItems.map(item => ({
                id_evento: item.id_evento,
                cantidad: item.cantidad,
                merchant: {
                    id_merchant: item.merchant?.id_merchant || null
                }
            }))
        };

        const order = await Order.create(orderData);

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

        //procesar pago
        await retry(() =>
            postJson('http://localhost:3002/process-payment', {
                orderId: order._id,
                amount: amountInCents
            }, authHeader), 4, 300);

        order.status = 'SHAVED';
        await order.save();

        return res.status(201).json({
            message: 'Order completed successfully',
            order
        });

    } catch (error) {
        console.error('Saga failed:', error);

        let orderToCompensate = null;

        if (req.body?.tempOrderId || error.orderId) {
            orderToCompensate = await Order.findById(req.body.tempOrderId || error.orderId);
        }

        if (orderToCompensate) {
            try {
                await retry(() =>
                    postJson('http://localhost:3002/eventos/release-inventory/', {
                        orderId: orderToCompensate._id
                    }, {}), 3, 300);
            } catch (compErr) {
                console.error('Error al liberar inventario (compensación):', compErr);
            }

            // Actualizar estado del order a FAILED
            orderToCompensate.status = 'FAILED';
            await orderToCompensate.save();
        }

        return res.status(500).json({
            message: 'Order failed',
            error: error.message,
            orderId: orderToCompensate?._id
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