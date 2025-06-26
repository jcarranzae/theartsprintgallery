'use client';

import React, { useEffect, useState } from 'react';

export default function ContenidoPage() {
    const [activeTab, setActiveTab] = useState('imagenes');
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

        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach((anchor: Element) => {
            (anchor as HTMLAnchorElement).addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
                e.preventDefault();
                const targetId = this.getAttribute('href')?.substring(1);
                if (targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        return () => observer.disconnect();
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const stats = [
        { number: "50K+", label: "Creadores activos", icon: "👥" },
        { number: "2.5M+", label: "Contenidos generados", icon: "🎨" },
        { number: "98%", label: "Precisión IA", icon: "🎯" },
        { number: "24/7", label: "Disponibilidad", icon: "⚡" }
    ];

    const features = [
        {
            icon: "🖼️",
            title: "Generación de Imágenes",
            description: "Crea imágenes espectaculares con IA de última generación",
            details: [
                "Modelos Flux Pro y Flux.1 Dev",
                "Resoluciones hasta 8K",
                "Estilos artísticos variados",
                "Control de aspectos y composición"
            ],
            tags: ["Flux", "Alta Resolución", "Artístico"]
        },
        {
            icon: "🎬",
            title: "Generación de Videos",
            description: "Transforma ideas en videos profesionales con Kling AI",
            details: [
                "Videos hasta 10 segundos",
                "Calidad 1080p profesional",
                "Imagen a video (I2V)",
                "Control de movimiento y cámara"
            ],
            tags: ["Kling AI", "Profesional", "I2V"]
        },
        {
            icon: "🎵",
            title: "Generación de Música",
            description: "Compone pistas musicales originales con IA",
            details: [
                "Múltiples géneros musicales",
                "Hasta 3 minutos de duración",
                "Calidad de estudio",
                "Letra personalizada opcional"
            ],
            tags: ["Original", "Estudio", "Personalizable"]
        },
        {
            icon: "✨",
            title: "Mejora de Prompts",
            description: "Optimiza automáticamente tus prompts para mejores resultados",
            details: [
                "IA especializada en prompts",
                "Análisis de contexto",
                "Sugerencias inteligentes",
                "Optimización por plataforma"
            ],
            tags: ["IA Especializada", "Optimizado", "Inteligente"]
        },
        {
            icon: "📐",
            title: "Escalado de Imágenes",
            description: "Aumenta la resolución sin perder calidad",
            details: [
                "Escalado hasta 4x",
                "Preservación de detalles",
                "IA de super resolución",
                "Múltiples formatos"
            ],
            tags: ["4x Escalado", "Sin Pérdida", "Múltiples Formatos"]
        },
        {
            icon: "🎯",
            title: "Context Flux",
            description: "Control avanzado de composición y elementos",
            details: [
                "Control de poses y gestos",
                "Composición avanzada",
                "Elementos específicos",
                "Consistencia visual"
            ],
            tags: ["Control Avanzado", "Precisión", "Consistente"]
        }
    ];

    const workflowSteps = [
        {
            step: "01",
            title: "Describe tu Idea",
            description: "Escribe tu prompt o usa nuestro generador inteligente",
            icon: "💡"
        },
        {
            step: "02",
            title: "Selecciona el Tipo",
            description: "Elige entre imagen, video, música o mejora de contenido",
            icon: "🎛️"
        },
        {
            step: "03",
            title: "Ajusta Parámetros",
            description: "Personaliza estilo, resolución y configuraciones avanzadas",
            icon: "⚙️"
        },
        {
            step: "04",
            title: "Genera y Descarga",
            description: "La IA procesa tu request y entrega resultados profesionales",
            icon: "🚀"
        }
    ];

    const pricingPlans = [
        {
            name: "Básico",
            price: "Gratis",
            description: "Para empezar a explorar",
            features: ["10 imágenes/mes", "5 videos/mes", "Calidad estándar"],
            buttonText: "Empezar Gratis",
            popular: false,
            tags: ["Gratis", "Básico"]
        },
        {
            name: "Plus",
            price: "€29/mes",
            description: "Para creadores profesionales",
            features: ["500 imágenes/mes", "100 videos/mes", "50 pistas/mes", "Calidad 4K"],
            buttonText: "Prueba Gratuita",
            popular: true,
            tags: ["Más Popular", "4K"]
        },
        {
            name: "Pro",
            price: "€99/mes",
            description: "Para equipos y empresas",
            features: ["Ilimitado", "API completa", "Soporte 24/7", "Calidad 8K"],
            buttonText: "Contactar",
            popular: false,
            tags: ["Enterprise", "Ilimitado"]
        }
    ];

    const faqs = [
        {
            question: "¿Qué tipos de contenido puedo generar?",
            answer: "Puedes generar imágenes de alta calidad, videos profesionales de hasta 10 segundos, música original y mejorar contenido existente. Soportamos múltiples estilos y formatos."
        },
        {
            question: "¿Cuál es la calidad máxima disponible?",
            answer: "Ofrecemos hasta 8K para imágenes, 1080p para videos y calidad de estudio para música. Los planes superiores incluyen resoluciones más altas y mejor calidad."
        },
        {
            question: "¿Los contenidos generados son únicos?",
            answer: "Sí, cada generación es única. Utilizamos modelos avanzados que crean contenido original basado en tu prompt específico, garantizando resultados únicos cada vez."
        },
        {
            question: "¿Puedo usar el contenido comercialmente?",
            answer: "Absolutamente. Todo el contenido generado te pertenece y puedes usarlo comercialmente sin restricciones, incluyendo venta, marketing y proyectos comerciales."
        },
        {
            question: "¿Cómo funciona la mejora de prompts?",
            answer: "Nuestro sistema IA analiza tu prompt inicial y lo optimiza automáticamente para mejores resultados, sugiriendo mejoras de estilo, composición y elementos técnicos."
        },
        {
            question: "¿Hay límites en los planes pagos?",
            answer: "El plan Plus tiene límites generosos (500 imágenes, 100 videos mensuales). El plan Pro ofrece generaciones ilimitadas y acceso completo a todas las funciones."
        }
    ];

    const contentTabs = [
        { id: 'imagenes', label: 'Imágenes', icon: '🖼️' },
        { id: 'videos', label: 'Videos', icon: '🎬' },
        { id: 'musica', label: 'Música', icon: '🎵' },
        { id: 'tools', label: 'Herramientas', icon: '🛠️' }
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
                
                .sticky-nav {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(34, 197, 94, 0.3);
                }
            `}</style>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Sticky Navigation */}
                <nav className="sticky-nav bg-gray-900/90">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-center space-x-8">
                            {[
                                { href: '#features', label: 'Funciones' },
                                { href: '#workflow', label: 'Proceso' },
                                { href: '#pricing', label: 'Precios' },
                                { href: '#faq', label: 'FAQ' }
                            ].map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className="text-gray-300 hover:text-green-400 font-medium transition-colors duration-300"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 border-b border-green-400/30">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                            Crea Contenido <span className="text-green-400 animate-pulse">Excepcional</span> con IA
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
                            Transforma tus ideas en imágenes espectaculares, videos profesionales y música original. Todo en una plataforma potenciada por la IA más avanzada.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#" className="bg-green-400 hover:bg-green-300 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                                Probar Gratis
                            </a>
                            <a href="#features" className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                                Ver Funciones
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center fade-in bg-gray-800 border border-green-400/30 rounded-xl p-6 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300">
                                    <div className="text-4xl mb-2">{stat.icon}</div>
                                    <div className="text-3xl font-extrabold text-green-400 mb-2">{stat.number}</div>
                                    <div className="text-gray-300 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Tabs */}
                <section className="py-20 bg-gray-800 border-y border-green-400/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Explora nuestras <span className="text-green-400">Herramientas</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Cada herramienta está diseñada para potenciar tu creatividad
                            </p>
                        </div>

                        <div className="flex justify-center mb-12">
                            <div className="bg-gray-900 border border-green-400/30 rounded-xl p-1 flex flex-wrap gap-1">
                                {contentTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                            ? 'bg-green-400 text-black'
                                            : 'text-gray-300 hover:text-green-400'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            {activeTab === 'imagenes' && (
                                <div className="fade-in">
                                    <h3 className="text-2xl font-bold text-green-400 mb-4">Generación de Imágenes</h3>
                                    <p className="text-gray-300 mb-6">Crea imágenes espectaculares con modelos Flux de última generación</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Flux Pro', 'Flux.1 Dev', 'Hasta 8K', 'Estilos Múltiples'].map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'videos' && (
                                <div className="fade-in">
                                    <h3 className="text-2xl font-bold text-green-400 mb-4">Generación de Videos</h3>
                                    <p className="text-gray-300 mb-6">Videos profesionales con Kling AI, imagen a video y control de movimiento</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Kling AI', '1080p', 'I2V', 'Control Cámara'].map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'musica' && (
                                <div className="fade-in">
                                    <h3 className="text-2xl font-bold text-green-400 mb-4">Generación de Música</h3>
                                    <p className="text-gray-300 mb-6">Compone música original en múltiples géneros con calidad de estudio</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Múltiples Géneros', 'Hasta 3 min', 'Calidad Estudio', 'Letra Opcional'].map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'tools' && (
                                <div className="fade-in">
                                    <h3 className="text-2xl font-bold text-green-400 mb-4">Herramientas Avanzadas</h3>
                                    <p className="text-gray-300 mb-6">Escalado de imágenes, mejora de prompts y Context Flux</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Escalado 4x', 'IA Prompts', 'Context Flux', 'Sin Pérdida'].map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Funciones <span className="text-green-400">Principales</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Herramientas profesionales diseñadas para maximizar tu creatividad
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-gray-800 border border-green-400/30 rounded-xl p-8 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300 fade-in group">
                                    <div className="text-4xl mb-6">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold mb-4 text-green-400">{feature.title}</h3>
                                    <p className="text-gray-300 group-hover:text-white transition-colors mb-6">{feature.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {feature.details.map((detail, i) => (
                                            <li key={i} className="text-gray-400 text-sm flex items-center">
                                                <span className="text-green-400 mr-2">•</span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-wrap gap-2">
                                        {feature.tags.map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section id="workflow" className="py-20 bg-gray-800 border-y border-green-400/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                ¿Cómo <span className="text-green-400">Funciona</span>?
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Un proceso simple de 4 pasos para crear contenido profesional
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {workflowSteps.map((step, index) => (
                                <div key={index} className="text-center fade-in">
                                    <div className="bg-gray-900 border border-green-400/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-4xl">
                                        {step.icon}
                                    </div>
                                    <div className="bg-green-400 text-black font-bold px-4 py-2 rounded-full text-sm mb-4 inline-block">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-gray-300">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Precios <span className="text-green-400">Transparentes</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Planes diseñados para cada tipo de creador
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <div key={index} className={`bg-gray-800 border rounded-xl p-8 transition-all duration-300 fade-in ${plan.popular
                                    ? 'border-2 border-green-400 transform scale-105 relative'
                                    : 'border border-green-400/30 hover:border-green-400/50'
                                    }`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-400 text-black px-6 py-2 rounded-full text-sm font-bold">
                                            Más Popular
                                        </div>
                                    )}

                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                        <div className="text-3xl font-bold text-green-400 mb-2">{plan.price}</div>
                                        <p className="text-gray-400">{plan.description}</p>

                                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                                            {plan.tags.map((tag, i) => (
                                                <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="text-gray-300 flex items-center">
                                                <span className="text-green-400 mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${plan.popular
                                        ? 'bg-green-400 hover:bg-green-300 text-black'
                                        : 'bg-gray-700 border border-green-400/30 hover:bg-gray-600 text-white'
                                        }`}>
                                        {plan.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-gray-800 border-y border-green-400/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Preguntas <span className="text-green-400">Frecuentes</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Respuestas a las consultas más comunes sobre nuestras herramientas
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-gray-900 border border-green-400/30 rounded-xl p-6 fade-in">
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
                            Empieza a Crear <span className="text-green-400">Hoy Mismo</span>
                        </h2>
                        <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
                            Únete a miles de creadores que ya están transformando sus ideas en contenido viral.
                            Sin compromisos, sin tarjeta de crédito.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#" className="bg-green-400 hover:bg-green-300 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105">
                                Crear Gratis Ahora
                            </a>
                            <a href="#" className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                                Ver Demo
                            </a>
                        </div>

                        <p className="text-sm text-gray-400 mt-6">
                            ✓ Setup en 2 minutos • ✓ Sin configuración técnica • ✓ Soporte en español
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}