// Configuración de precios de Stripe
export const STRIPE_PRICES = {
    // Plan Plus
    PLUS_MONTHLY: 'price_plus_monthly', // Reemplazar con el ID real de Stripe
    PLUS_YEARLY: 'price_plus_yearly',   // Reemplazar con el ID real de Stripe

    // Plan Pro
    PRO_MONTHLY: 'price_pro_monthly',   // Reemplazar con el ID real de Stripe
    PRO_YEARLY: 'price_pro_yearly',     // Reemplazar con el ID real de Stripe
} as const;

export type StripePriceId = typeof STRIPE_PRICES[keyof typeof STRIPE_PRICES];

// Mapeo de planes a precios
export const getPriceId = (planName: string, billingPeriod: 'monthly' | 'yearly'): StripePriceId | null => {
    switch (planName.toLowerCase()) {
        case 'plus':
            return billingPeriod === 'monthly' ? STRIPE_PRICES.PLUS_MONTHLY : STRIPE_PRICES.PLUS_YEARLY;
        case 'pro':
            return billingPeriod === 'monthly' ? STRIPE_PRICES.PRO_MONTHLY : STRIPE_PRICES.PRO_YEARLY;
        default:
            return null;
    }
}; 