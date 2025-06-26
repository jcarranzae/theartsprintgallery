'use client';

import React, { useEffect, useState } from 'react';

export default function FeaturesPage() {
    const [activeSection, setActiveSection] = useState('generacion-imagenes');

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const id = entry.target.getAttribute('id');
                    if (id) setActiveSection(id);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style jsx>{`
                .fade-in, .slide-in-left, .slide-in-right {
                    opacity: 0;
                    transition: all 1s ease-in-out;
                }
                .slide-in-left {
                    transform: translateX(-50px);
                }
                .slide-in-right {
                    transform: translateX(50px);
                }
                .fade-in.visible, .slide-in-left.visible, .slide-in-right.visible {
                    opacity: 1 !important;
                    transform: translateX(0) !important;
                }
            `}</style>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Page Header */}
                <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 border-b border-green-400/30">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                            Funciones <span className="text-green-400 animate-pulse">Avanzadas</span> de IA
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                            Descubre todas las herramientas profesionales que tienes a tu disposición para crear contenido multimedia extraordinario
                        </p>
                    </div>
                </section>

                {/* Feature Navigation */}
                <div className="sticky top-0 bg-gray-800 border-b border-green-400/30 z-40">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap justify-center gap-2 py-4">
                            {[
                                { id: 'generacion-imagenes', icon: '🎨', label: 'Imágenes' },
                                { id: 'generacion-videos', icon: '🎬', label: 'Videos' },
                                { id: 'generacion-musica', icon: '🎵', label: 'Música' },
                                { id: 'optimizacion-social', icon: '📱', label: 'Redes Sociales' },
                                { id: 'herramientas-avanzadas', icon: '⚡', label: 'Herramientas' }
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${activeSection === item.id
                                        ? 'bg-green-400 text-black'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-green-400 border border-green-400/30'
                                        }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveSection(item.id);
                                        document.getElementById(item.id)?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start'
                                        });
                                    }}
                                >
                                    {item.icon} {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generación de Imágenes */}
                <section id="generacion-imagenes" className="feature-section py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Generación de <span className="text-green-400">Imágenes</span> con IA
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Modelos de última generación para crear imágenes profesionales, desde fotorrealismo hasta arte conceptual
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '🖼️',
                                    title: 'Editor Canny',
                                    description: 'Transforma bocetos simples en imágenes detalladas.',
                                    tags: ['Sketch-to-Image', 'Control de Bordes']
                                },
                                {
                                    icon: '🎯',
                                    title: 'Relleno Inteligente',
                                    description: 'Completa o edita partes específicas de imágenes.',
                                    tags: ['Inpainting', 'Edición Precisa']
                                },
                                {
                                    icon: '📈',
                                    title: 'Escalado de Imágenes',
                                    description: 'Aumenta la resolución hasta 4x sin perder calidad.',
                                    tags: ['Upscaling', '4x Resolución']
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-gray-800 border border-green-400/30 rounded-xl p-8 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300 fade-in group">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold mb-4 text-green-400">{feature.title}</h3>
                                    <p className="text-gray-300 group-hover:text-white transition-colors mb-6">{feature.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {feature.tags.map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección de Generación de Videos */}
                <section id="generacion-videos" className="feature-section py-20 bg-gray-800 border-y border-green-400/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Generación de <span className="text-green-400">Videos</span> con IA
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Transforma ideas en videos profesionales con control total sobre el resultado
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '🎬',
                                    title: 'Texto a Video',
                                    description: 'Crea videos cinematográficos solo describiendo lo que imaginas.',
                                    tags: ['Text-to-Video', 'Cinematográfico']
                                },
                                {
                                    icon: '📸',
                                    title: 'Imagen a Video',
                                    description: 'Anima cualquier imagen con movimientos naturales y realistas.',
                                    tags: ['Image-to-Video', 'Animación']
                                },
                                {
                                    icon: '🎮',
                                    title: 'Control de Cámara',
                                    description: 'Dirigir movimientos de cámara específicos para efectos profesionales.',
                                    tags: ['Camera Control', 'Efectos']
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-gray-900 border border-green-400/30 rounded-xl p-8 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300 fade-in group">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold mb-4 text-green-400">{feature.title}</h3>
                                    <p className="text-gray-300 group-hover:text-white transition-colors mb-6">{feature.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {feature.tags.map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección de Generación de Música */}
                <section id="generacion-musica" className="feature-section py-20 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-extrabold mb-4 text-white">
                                Generación de <span className="text-green-400">Música</span> Original
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Compone música única y personalizada para cualquier proyecto o estado de ánimo
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '🎵',
                                    title: 'Composición por Descripción',
                                    description: 'Describe el estilo, tempo y mood para generar música perfecta.',
                                    tags: ['AI Composer', 'Personalizada']
                                },
                                {
                                    icon: '🎸',
                                    title: 'Múltiples Géneros',
                                    description: 'Desde clásica hasta electrónica, todos los estilos disponibles.',
                                    tags: ['Multi-Género', 'Versátil']
                                },
                                {
                                    icon: '🎚️',
                                    title: 'Control de Duración',
                                    description: 'Ajusta la duración exacta para tu proyecto específico.',
                                    tags: ['Duración Variable', 'Precisión']
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-gray-800 border border-green-400/30 rounded-xl p-8 hover:bg-gray-700 hover:border-green-400/50 transition-all duration-300 fade-in group">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-2xl font-bold mb-4 text-green-400">{feature.title}</h3>
                                    <p className="text-gray-300 group-hover:text-white transition-colors mb-6">{feature.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {feature.tags.map((tag, i) => (
                                            <span key={i} className="bg-green-400/10 border border-green-400/30 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 bg-gradient-to-r from-gray-800 to-black border-t border-green-400/30">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-3xl font-extrabold mb-4 text-white">
                            ¿Listo para Explorar Todas las <span className="text-green-400">Funciones</span>?
                        </h3>
                        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
                            Empieza gratis y descubre el poder completo de la IA creativa
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#" className="bg-green-400 hover:bg-green-300 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                                Comenzar Gratis
                            </a>
                            <a href="#" className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                                Ver Demo en Vivo
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
} 