'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Zap, Settings, CreditCard, Calendar } from 'lucide-react';
import { customerPortalAction } from '@/lib/payments/actions';
import { useFormStatus } from 'react-dom';

interface SubscriptionStatusProps {
    plan?: {
        name: string;
        status: string;
        nextBilling?: string;
        features: string[];
    };
    usage?: {
        images: { used: number; limit: number };
        videos: { used: number; limit: number };
        music: { used: number; limit: number };
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

export function SubscriptionStatus({ plan, usage }: SubscriptionStatusProps) {
    const getPlanIcon = () => {
        switch (plan?.name?.toLowerCase()) {
            case 'plus':
                return <Zap className="h-5 w-5 text-green-400" />;
            case 'pro':
                return <Crown className="h-5 w-5 text-yellow-400" />;
            default:
                return <CreditCard className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = () => {
        if (!plan) return <Badge variant="secondary">Gratuito</Badge>;

        switch (plan.status) {
            case 'active':
                return <Badge className="bg-green-500">Activo</Badge>;
            case 'trialing':
                return <Badge className="bg-blue-500">Período de Prueba</Badge>;
            case 'canceled':
                return <Badge variant="destructive">Cancelado</Badge>;
            case 'unpaid':
                return <Badge variant="destructive">Impago</Badge>;
            default:
                return <Badge variant="secondary">{plan.status}</Badge>;
        }
    };

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === -1) return 0; // Ilimitado
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-6">
            {/* Plan Actual */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getPlanIcon()}
                            <CardTitle className="text-xl">
                                Plan {plan?.name || 'Gratuito'}
                            </CardTitle>
                        </div>
                        {getStatusBadge()}
                    </div>
                    <CardDescription>
                        {plan?.nextBilling && (
                            <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4" />
                                Próxima facturación: {new Date(plan.nextBilling).toLocaleDateString('es-ES')}
                            </div>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Características del Plan */}
                    {plan?.features && (
                        <div>
                            <h4 className="font-medium mb-2">Características incluidas:</h4>
                            <ul className="space-y-1">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-green-500">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Gestionar Suscripción */}
                    {plan && (
                        <form action={customerPortalAction}>
                            <ManageButton />
                        </form>
                    )}

                    {/* Botón para actualizar plan */}
                    {!plan && (
                        <Button
                            onClick={() => window.location.href = '/pricing'}
                            className="w-full bg-green-400 hover:bg-green-300 text-black"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Actualizar Plan
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Uso de Recursos */}
            {usage && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Uso del Mes Actual</CardTitle>
                        <CardDescription>
                            Seguimiento de tu consumo mensual
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Imágenes */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Imágenes generadas</span>
                                <span>
                                    {usage.images.used}/{usage.images.limit === -1 ? '∞' : usage.images.limit}
                                </span>
                            </div>
                            {usage.images.limit !== -1 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                                            getUsagePercentage(usage.images.used, usage.images.limit)
                                        )}`}
                                        style={{
                                            width: `${getUsagePercentage(usage.images.used, usage.images.limit)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Videos */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Videos generados</span>
                                <span>
                                    {usage.videos.used}/{usage.videos.limit === -1 ? '∞' : usage.videos.limit}
                                </span>
                            </div>
                            {usage.videos.limit !== -1 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                                            getUsagePercentage(usage.videos.used, usage.videos.limit)
                                        )}`}
                                        style={{
                                            width: `${getUsagePercentage(usage.videos.used, usage.videos.limit)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Música */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Pistas musicales</span>
                                <span>
                                    {usage.music.used}/{usage.music.limit === -1 ? '∞' : usage.music.limit}
                                </span>
                            </div>
                            {usage.music.limit !== -1 && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(
                                            getUsagePercentage(usage.music.used, usage.music.limit)
                                        )}`}
                                        style={{
                                            width: `${getUsagePercentage(usage.music.used, usage.music.limit)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 