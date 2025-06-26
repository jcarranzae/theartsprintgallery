import { stripe } from '@/lib/payments/stripe';
import { STRIPE_PRICES } from '@/config/stripe-prices';

/**
 * Script para verificar que la configuración de Stripe está correcta
 * Ejecutar con: npx tsx scripts/verify-stripe-setup.ts
 */

async function verifyStripeSetup() {
    console.log('🔍 Verificando configuración de Stripe...\n');

    try {
        // 1. Verificar conexión con Stripe
        console.log('1. Verificando conexión con Stripe...');
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Conectado correctamente. Cuenta: ${account.id}\n`);

        // 2. Verificar que los precios existen
        console.log('2. Verificando precios configurados...');
        const priceChecks = [
            { name: 'Plus Mensual', id: STRIPE_PRICES.PLUS_MONTHLY },
            { name: 'Plus Anual', id: STRIPE_PRICES.PLUS_YEARLY },
            { name: 'Pro Mensual', id: STRIPE_PRICES.PRO_MONTHLY },
            { name: 'Pro Anual', id: STRIPE_PRICES.PRO_YEARLY },
        ];

        for (const price of priceChecks) {
            try {
                const priceData = await stripe.prices.retrieve(price.id);
                const amount = priceData.unit_amount ? (priceData.unit_amount / 100) : 0;
                const interval = priceData.recurring?.interval || 'one-time';

                console.log(`✅ ${price.name}: €${amount}/${interval} (ID: ${price.id})`);
            } catch (error) {
                console.log(`❌ ${price.name}: Error - ${(error as Error).message} (ID: ${price.id})`);
            }
        }

        // 3. Verificar productos asociados
        console.log('\n3. Verificando productos...');
        const products = await stripe.products.list({ active: true });

        products.data.forEach(product => {
            console.log(`📦 Producto: ${product.name} (ID: ${product.id})`);
        });

        // 4. Verificar webhooks (solo mostrar configuración)
        console.log('\n4. Verificando webhooks...');
        const webhooks = await stripe.webhookEndpoints.list();

        if (webhooks.data.length === 0) {
            console.log('⚠️  No hay webhooks configurados');
        } else {
            webhooks.data.forEach(webhook => {
                console.log(`🔗 Webhook: ${webhook.url}`);
                console.log(`   Eventos: ${webhook.enabled_events.join(', ')}`);
            });
        }

        // 5. Resumen de variables de entorno
        console.log('\n5. Variables de entorno...');
        console.log(`✅ STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'Configurada' : '❌ Faltante'}`);
        console.log(`✅ STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Configurada' : '❌ Faltante'}`);
        console.log(`✅ BASE_URL: ${process.env.BASE_URL || '❌ Faltante'}`);

        console.log('\n🎉 Verificación completada!');

    } catch (error) {
        console.error('❌ Error en la verificación:', (error as Error).message);

        if ((error as Error).message.includes('Invalid API Key')) {
            console.log('\n💡 Solución: Verifica que STRIPE_SECRET_KEY esté configurada correctamente');
        }

        process.exit(1);
    }
}

// Ejecutar verificación
verifyStripeSetup().catch(console.error); 