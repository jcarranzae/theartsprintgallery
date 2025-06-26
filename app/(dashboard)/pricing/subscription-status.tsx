'use client';

import { Button } from '@/components/ui/button';
import { Settings, Zap } from 'lucide-react';
import { customerPortalAction } from '@/lib/payments/actions';
import { useFormStatus } from 'react-dom';

interface SubscriptionStatusProps {
    plan?: {
        name: string;
        status: string;
        nextBilling?: string;
    };
}

function ManageButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            variant="outline"
            className="w-full"
        >
            {pending ? (
                <>
                    <Settings className="animate-spin mr-2 h-4 w-4" />
                    Cargando...
                </>
            ) : (
                <>
                    <Settings className="mr-2 h-4 w-4" />
                    Gestionar Suscripción
                </>
            )}
        </Button>
    );
}

export function SubscriptionStatus({ plan }: SubscriptionStatusProps) {
    const getStatusBadge = () => {
        if (!plan) {
            return (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Gratuito
                </span>
            );
        }

        switch (plan.status) {
            case 'active':
                return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Activo
                    </span>
                );
            case 'trialing':
                return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Período de Prueba
                    </span>
                );
            case 'canceled':
                return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Cancelado
                    </span>
                );
            case 'unpaid':
                return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Impago
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {plan.status}
                    </span>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Plan {plan?.name || 'Gratuito'}
                </h3>
                {getStatusBadge()}
            </div>

            {plan?.nextBilling && (
                <p className="text-sm text-gray-600">
                    Próxima facturación: {new Date(plan.nextBilling).toLocaleDateString('es-ES')}
                </p>
            )}

            <div className="pt-4">
                {plan ? (
                    <form action={customerPortalAction}>
                        <ManageButton />
                    </form>
                ) : (
                    <Button
                        onClick={() => window.location.href = '/pricing'}
                        className="w-full bg-green-400 hover:bg-green-300 text-black"
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        Actualizar Plan
                    </Button>
                )}
            </div>
        </div>
    );
} 