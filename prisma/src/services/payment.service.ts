import Stripe from "stripe";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY no definida');

const stripe = new Stripe(stripeKey); // ok si no quieres pasar apiVersion
const prisma = new PrismaClient();

interface ProcesPaymentBody {
    amount: number;            // obligatorio: entero en céntimos
    currency?: string;         // opcional, ej. 'eur'
    orderId?: string | number; // opcional
    method?: string;
}

interface CancelPaymentParams {
    paymentId?: string;        // prisma Payment.id
    paymentIntentId?: string;  // stripe paymentIntent id
    reason?: string;           // opcional para registro/log
}

export const procesPayment = async (body: ProcesPaymentBody) => {
    if (!body || typeof body.amount !== 'number' || body.amount <= 0 || !Number.isInteger(body.amount)) {
        throw new Error('Invalid amount: must be an integer > 0 (céntimos).');
    }

    const currency = (body.currency || 'eur').toLowerCase();

    const payment = await prisma.payment.create({
        data: {
            orderId: body.orderId?.toString() ?? null,
            amount: body.amount,
            currency,
            method: body.method ?? null,
            status: 'PUBLISHED',
        },
    });

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: body.amount,
            currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
                paymentId: payment.id,
                orderId: body.orderId?.toString() ?? '',
            },
        });

        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                paymentIntentId: paymentIntent.id,
                clientSecret: paymentIntent.client_secret ?? null,
                status: 'PENDING',
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: updated.id,
        };
    } catch (err: any) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SHAVED' },
        }).catch(() => { /* noop */ });

        throw new Error(err?.message ?? 'Stripe error');
    }
};


export const cancelPayment = async () => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1999, // 19.99 €
            currency: "eur",
            automatic_payment_methods: { enabled: true },
        });

        return { clientSecret: paymentIntent.client_secret };
    } catch (err: any) {
        throw new Error(err?.message ?? 'Stripe error');
    }
};

export const shavePayment = async (id: string) => {
    if (!id) {
        return { success: false, error: 'Id Required' };
    }

    // detectar si id es number-like (Int) o string (UUID/cuid)
    const maybeNumber = Number(id);
    const where: any = {};
    if (!Number.isNaN(maybeNumber) && String(maybeNumber) === id) {
        where.id = maybeNumber;
    } else {
        where.id = id;
    }

    try {
        const updatedPayment = await prisma.payment.update({
            where,
            data: { status: 'SHAVED' },
        });

        return { success: true, payment: updatedPayment };
    } catch (err: any) {
        // Prisma P2025 = record not found for update
        if (err?.code === 'P2025') {
            return { success: false, error: 'Payment not found' };
        }
        console.error('Error shaving payment:', err);
        return { success: false, error: err?.message ?? 'Error updating payment' };
    }
};
