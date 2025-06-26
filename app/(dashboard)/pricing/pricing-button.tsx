'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Crown, Zap } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { checkoutAction } from '@/lib/payments/actions';
import { getPriceId } from '@/config/stripe-prices';

interface PricingButtonProps {
    planName: string;
    planType: 'free' | 'plus' | 'pro' | 'enterprise';
    buttonText: string;
    buttonVariant: 'default' | 'outline';
    billingPeriod: 'monthly' | 'yearly';
    popular?: boolean;
}

function SubmitButton({ planType, buttonText, buttonVariant, popular }: Omit<PricingButtonProps, 'planName' | 'billingPeriod'>) {
    const { pending } = useFormStatus();

    const getIcon = () => {
        if (pending) return <Loader2 className="animate-spin mr-2 h-4 w-4" />;
        if (planType === 'plus' && popular) return <Zap className="mr-2 h-4 w-4" />;
        if (planType === 'pro') return <Crown className="mr-2 h-4 w-4" />;
        return <ArrowRight className="ml-2 h-4 w-4" />;
    };

    const getButtonClasses = () => {
        const baseClasses = "w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105";

        if (buttonVariant === 'default') {
            return `${baseClasses} bg-green-400 hover:bg-green-300 text-black shadow-lg shadow-green-400/25`;
        }

        return `${baseClasses} bg-gray-700 border border-green-400/30 hover:bg-gray-600 hover:border-green-400/50 text-white`;
    };

    return (
        <Button
            type="submit"
            disabled={pending}
            className={getButtonClasses()}
        >
            {pending ? (
                <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Procesando...
                </>
            ) : (
                <>
                    {planType === 'plus' && popular && <Zap className="mr-2 h-4 w-4" />}
                    {planType === 'pro' && <Crown className="mr-2 h-4 w-4" />}
                    {buttonText}
                    {planType !== 'plus' && planType !== 'pro' && <ArrowRight className="ml-2 h-4 w-4" />}
                </>
            )}
        </Button>
    );
}

export function PricingButton({ planName, planType, buttonText, buttonVariant, billingPeriod, popular = false }: PricingButtonProps) {

    // Plan gratuito - redirigir al dashboard
    if (planType === 'free') {
        return (
            <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 bg-gray-700 border border-green-400/30 hover:bg-gray-600 hover:border-green-400/50 text-white transform hover:scale-105"
            >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        );
    }

    // Plan enterprise - contacto
    if (planType === 'enterprise') {
        return (
            <Button
                onClick={() => window.location.href = '/contact'}
                className="w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 bg-gray-700 border border-green-400/30 hover:bg-gray-600 hover:border-green-400/50 text-white transform hover:scale-105"
            >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        );
    }

    // Planes de pago (Plus y Pro)
    const priceId = getPriceId(planName, billingPeriod);

    if (!priceId) {
        return (
            <Button
                disabled
                className="w-full font-bold py-3 px-6 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed"
            >
                Configuración pendiente
            </Button>
        );
    }

    return (
        <form action={checkoutAction}>
            <input type="hidden" name="priceId" value={priceId} />
            <SubmitButton
                planType={planType}
                buttonText={buttonText}
                buttonVariant={buttonVariant}
                popular={popular}
            />
        </form>
    );
} 