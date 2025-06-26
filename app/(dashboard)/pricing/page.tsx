'use client';

import React, { useEffect, useState } from 'react';
import { PricingButton } from './pricing-button';

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const pricingPlans = [
        {
            name: 'Básico',
            planType: 'free' as const,
            price: 'Gratis',
            period: 'Para siempre',
            description: 'Perfecto para empezar',
            features: [
                '10 imágenes al mes',
                '5 videos al mes',
                'Calidad estándar',
                'Galería personal',
                'Formatos básicos',
                'Soporte por comunidad',
                'Marca de agua en contenido'
            ],
            buttonText: 'Empezar Gratis',
            buttonVariant: 'outline' as const,
            popular: false,
            tags: ['Principiantes', 'Gratis']
        },
        {
            name: 'Plus',
            planType: 'plus' as const,
            price: billingPeriod === 'monthly' ? '€29' : '€23',
            period: billingPeriod === 'monthly' ? 'por mes' : 'por mes (anual)',
            originalPrice: billingPeriod === 'yearly' ? '€29' : undefined,
            description: 'Para creadores profesionales',
            features: [
                '500 imágenes al mes',
                '100 videos al mes',
                '50 pistas musicales al mes',
                'Calidad premium (4K)',
                'Todos los formatos y modelos',
                'Optimización automática para redes',
                'Sin marca de agua',
                'Soporte prioritario',
                'Galería avanzada con tags',
                'Exportación en lote'
            ],
            buttonText: 'Empezar Prueba de 14 Días',
            buttonVariant: 'default' as const,
            popular: true,
            tags: ['Más Popular', 'Profesional']
        },
        {
            name: 'Pro',
            planType: 'pro' as const,
            price: billingPeriod === 'monthly' ? '€99' : '€79',
            period: billingPeriod === 'monthly' ? 'por mes' : 'por mes (anual)',
            originalPrice: billingPeriod === 'yearly' ? '€99' : undefined,
            description: 'Para equipos y empresas',
            features: [
                'Imágenes ilimitadas',
                'Videos ilimitados',
                'Música ilimitada',
                'Máxima calidad (8K)',
                'Acceso completo a API',
                'Gestión de equipos (hasta 10 usuarios)',
                'Workspaces colaborativos',
                'Roles y permisos personalizados',
                'Soporte 24/7 dedicado',
                'Videollamadas de soporte',
                'Integraciones personalizadas',
                'SLA garantizado'
            ],
            buttonText: 'Contactar Ventas',
            buttonVariant: 'outline' as const,
            popular: false,
            tags: ['Enterprise', 'Ilimitado']
        }
    ];

    const enterpriseFeatures = [
        {
            title: 'Enterprise Features',
            items: [
                'Usuarios ilimitados',
                'Implementación on-premise',
                'Integración con SSO',
                'Compliance GDPR/SOC2'
            ]
        },
        {
            title: 'Custom Solutions',
            items: [
                'Modelos IA personalizados',
                'Integraciones a medida',
                'Flujos de trabajo específicos',
                'Branding personalizado'
            ]
        },
        {
            title: 'Support & Security',
            items: [
                'Soporte 24/7 dedicado',
                'Account Manager exclusivo',
                'Seguridad enterprise',
                'SLA personalizado'
            ]
        }
    ];

    const faqs = [
        {
            question: "¿Puedo cambiar de plan en cualquier momento?",
            answer: "Sí, puedes cambiar de plan cuando quieras. Si subes de plan, los cambios son inmediatos. Si bajas de plan, los cambios se aplicarán en tu próximo ciclo de facturación para que no pierdas tiempo pagado."
        },
        {
            question: "¿Qué sucede si supero los límites de mi plan?",
            answer: "Si alcanzas los límites, te notificaremos y podrás elegir entre esperar al próximo mes o actualizar tu plan inmediatamente. No cortamos el servicio abruptamente - siempre te damos opciones."
        },
        {
            question: "¿Los créditos no utilizados se acumulan?",
            answer: "Los créditos se renuevan cada mes y no se acumulan, excepto en el plan Pro donde tienes generaciones ilimitadas. Esto nos permite mantener los precios competitivos y el servicio de alta calidad."
        },
        {
            question: "¿Ofrecen descuentos para estudiantes o ONGs?",
            answer: "Sí, ofrecemos descuentos del 50% para estudiantes con email institucional válido y descuentos especiales para organizaciones sin fines de lucro. Contacta a nuestro equipo de ventas para más información."
        },
        {
            question: "¿Hay costos ocultos o cargos adicionales?",
            answer: "No, el precio que ves es el precio que pagas. No hay costos de configuración, cargos por almacenamiento o tarifas ocultas. Todo está incluido en tu plan mensual o anual."
        },
        {
            question: "¿Puedo cancelar mi suscripción fácilmente?",
            answer: "Absolutamente. Puedes cancelar tu suscripción desde tu panel de usuario en cualquier momento. No hay contratos de permanencia ni penalizaciones. Conservarás acceso hasta el final de tu período de facturación actual."
        }
    ];

    return (
        <>
            <style jsx>{`
                .fade-in {
                    opacity: 0;
                    transition: all 1s ease-in-out;
                }
                .fade-in.visible {
                    opacity: 1 !important;
                }
            `}</style>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Page Header */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 border-b border-green-400/30">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                            Planes que se Adaptan a <span className="text-green-400 animate-pulse">Ti</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                            Desde creadores individuales hasta equipos profesionales. Encuentra el plan perfecto para tu flujo de trabajo creativo
                        </p>
                    </div>
                </section>

                {/* Pricing Toggle */}
                <section className="py-12 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex bg-gray-800 border-2 border-green-400/30 rounded-xl p-1">
                                <button
                                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${billingPeriod === 'monthly'
                                        ? 'bg-green-400 text-black'
                                        : 'text-gray-300 hover:text-green-400'
                                        }`}
                                    onClick={() => setBillingPeriod('monthly')}
                                >
                                    Mensual
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${billingPeriod === 'yearly'
                                        ? 'bg-green-400 text-black'
                                        : 'text-gray-300 hover:text-green-400'
                                        }`}
                                    onClick={() => setBillingPeriod('yearly')}
                                >
                                    Anual
                                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        -20%
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Elige tu <span className="text-green-400">Plan Perfecto</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Todos los planes incluyen acceso completo a nuestras herramientas de IA
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <div key={index} className={`bg-gray-800 border rounded-xl p-8 transition-all duration-300 fade-in group ${plan.popular
                                    ? 'border-2 border-green-400 transform scale-105 relative'
                                    : 'border border-green-400/30 hover:border-green-400/50'
                                    }`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-400 text-black px-6 py-2 rounded-full text-sm font-bold">
                                            Más Popular
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <div className="text-4xl font-bold text-green-400">{plan.price}</div>
                                            {plan.originalPrice && (
                                                <div className="text-lg text-gray-500 line-through">{plan.originalPrice}</div>
                                            )}
                                        </div>
                                        <div className="text-gray-300">{plan.period}</div>
                                        {billingPeriod === 'yearly' && plan.planType !== 'free' && (
                                            <div className="inline-block bg-green-400/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium mt-2">
                                                ¡Ahorra 20%!
                                            </div>
                                        )}
                                        <p className="text-gray-400 mt-2">{plan.description}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                                            {plan.tags.map((tag, i) => (
                                                <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center">
                                                <span className="text-green-400 mr-3">✓</span>
                                                <span className="text-gray-300 group-hover:text-white transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <PricingButton
                                        planName={plan.name}
                                        planType={plan.planType}
                                        buttonText={plan.buttonText}
                                        buttonVariant={plan.buttonVariant}
                                        billingPeriod={billingPeriod}
                                        popular={plan.popular}
                                    />
                                    {index === 0 && (
                                        <p className="text-center text-sm text-gray-400 mt-3">
                                            ✓ No se requiere tarjeta de crédito
                                        </p>
                                    )}
                                    {index === 1 && (
                                        <div className="text-center text-sm text-gray-400 mt-3 space-y-1">
                                            <p>✓ 14 días de prueba gratuita</p>
                                            <p>✓ Cancela cuando quieras</p>
                                        </div>
                                    )}
                                    {index === 2 && (
                                        <div className="text-center text-sm text-gray-400 mt-3 space-y-1">
                                            <p>✓ Demo personalizada disponible</p>
                                            <p>✓ Implementación asistida</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Enterprise Section */}
                <section className="py-20 bg-gray-800 border-y border-green-400/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                ¿Necesitas algo más <span className="text-green-400">Enterprise</span>?
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Para organizaciones grandes con necesidades específicas, ofrecemos soluciones completamente personalizadas
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {enterpriseFeatures.map((category, index) => (
                                <div key={index} className="bg-gray-900 border border-green-400/30 rounded-xl p-8 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300 fade-in group">
                                    <h4 className="font-bold mb-4 text-green-400 text-lg flex items-center">
                                        {index === 0 && '🏢'} {index === 1 && '🎯'} {index === 2 && '🛡️'} {category.title}
                                    </h4>
                                    <ul className="space-y-2">
                                        {category.items.map((item, i) => (
                                            <li key={i} className="text-gray-300 group-hover:text-white transition-colors flex items-center">
                                                <span className="text-green-400 mr-2">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <PricingButton
                                    planName="Enterprise"
                                    planType="enterprise"
                                    buttonText="Contactar Enterprise"
                                    buttonVariant="default"
                                    billingPeriod={billingPeriod}
                                />
                                <PricingButton
                                    planName="Enterprise"
                                    planType="enterprise"
                                    buttonText="Agendar Demo"
                                    buttonVariant="outline"
                                    billingPeriod={billingPeriod}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Preguntas sobre <span className="text-green-400">Precios</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Resolvemos las dudas más comunes sobre nuestros planes
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-gray-800 border border-green-400/30 rounded-xl p-6 fade-in">
                                    <button
                                        className="w-full flex justify-between items-center text-left"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span className="text-lg font-bold text-white">{faq.question}</span>
                                        <span className="text-2xl text-green-400 transform transition-transform duration-300">
                                            {openFaq === index ? '−' : '+'}
                                        </span>
                                    </button>

                                    {openFaq === index && (
                                        <div className="mt-4 pt-4 border-t border-green-400/30">
                                            <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 bg-gradient-to-r from-gray-800 to-black border-t border-green-400/30">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-extrabold mb-6 text-white">
                            ¿Listo para Potenciar tu <span className="text-green-400">Creatividad</span>?
                        </h2>
                        <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
                            Únete a más de 25,000 creadores que ya están transformando sus ideas en contenido viral.
                            Comienza gratis, sin compromisos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <PricingButton
                                planName="Básico"
                                planType="free"
                                buttonText="Empezar Gratis Ahora"
                                buttonVariant="default"
                                billingPeriod={billingPeriod}
                            />
                            <PricingButton
                                planName="Enterprise"
                                planType="enterprise"
                                buttonText="Agendar Demo"
                                buttonVariant="outline"
                                billingPeriod={billingPeriod}
                            />
                        </div>

                        <p className="text-sm text-gray-400 mt-6">
                            Sin tarjeta de crédito • Configuración en 2 minutos • Soporte en español
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}