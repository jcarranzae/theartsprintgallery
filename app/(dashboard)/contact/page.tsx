'use client';

import React, { useState, useEffect } from 'react';

export default function ContactPage() {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        empresa: '',
        telefono: '',
        asunto: '',
        mensaje: ''
    });
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

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

        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right').forEach(el => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setFormData({
            nombre: '',
            email: '',
            empresa: '',
            telefono: '',
            asunto: '',
            mensaje: ''
        });

        setTimeout(() => {
            setShowSuccess(false);
        }, 5000);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNewsletterSubmitted(true);
        setNewsletterEmail('');

        setTimeout(() => {
            setNewsletterSubmitted(false);
        }, 3000);
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const departments = [
        {
            icon: '🛠️',
            title: 'Soporte Técnico',
            description: 'Problemas con la plataforma, errores, bugs o dificultades técnicas',
            email: 'soporte@artprintsgallery.com'
        },
        {
            icon: '💰',
            title: 'Ventas',
            description: 'Información sobre planes, precios, demos y pruebas gratuitas',
            email: 'ventas@artprintsgallery.com'
        },
        {
            icon: '🧾',
            title: 'Facturación',
            description: 'Gestión de pagos, facturas, cambios de plan y reembolsos',
            email: 'facturacion@artprintsgallery.com'
        },
        {
            icon: '🤝',
            title: 'Partnerships',
            description: 'Colaboraciones, integraciones, API y acuerdos comerciales',
            email: 'partnerships@artprintsgallery.com'
        },
        {
            icon: '📰',
            title: 'Prensa',
            description: 'Medios de comunicación, entrevistas y recursos de prensa',
            email: 'prensa@artprintsgallery.com'
        },
        {
            icon: '👑',
            title: 'Ejecutivo',
            description: 'Contacto directo con el equipo ejecutivo para asuntos estratégicos',
            email: 'ejecutivo@artprintsgallery.com'
        }
    ];

    const faqs = [
        {
            question: "¿Cómo puedo empezar a usar la plataforma?",
            answer: "Solo necesitas registrarte con tu email y podrás empezar a crear contenido inmediatamente. Ofrecemos un plan gratuito con 10 imágenes y 5 videos al mes para que pruebes todas las funciones."
        },
        {
            question: "¿Qué métodos de pago aceptan?",
            answer: "Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, American Express), PayPal y transferencias bancarias para planes enterprise. Todos los pagos son procesados de forma segura através de Stripe."
        },
        {
            question: "¿Puedo cancelar mi suscripción en cualquier momento?",
            answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario. No hay compromisos a largo plazo y conservarás acceso hasta el final de tu período de facturación actual."
        },
        {
            question: "¿Los contenidos generados tienen derechos de autor?",
            answer: "Todo el contenido que generas es tuyo. Puedes usarlo comercialmente sin restricciones, incluyendo para venta, marketing, redes sociales o cualquier proyecto comercial."
        },
        {
            question: "¿Ofrecen soporte técnico?",
            answer: "Sí, ofrecemos soporte 24/7 por chat para todos los usuarios. Los usuarios de planes Plus y Pro también tienen acceso a soporte prioritario por email y videollamadas."
        },
        {
            question: "¿Puedo integrar la plataforma con mi aplicación?",
            answer: "Los usuarios del plan Pro tienen acceso completo a nuestra API RESTful. Esto te permite integrar nuestras capacidades de generación de contenido directamente en tus propias aplicaciones."
        },
        {
            question: "¿Qué tan segura es mi información?",
            answer: "Utilizamos cifrado de extremo a extremo y cumplimos con GDPR y SOC2. Tus datos nunca se comparten con terceros y puedes eliminar toda tu información en cualquier momento."
        },
        {
            question: "¿Ofrecen entrenamientos o tutoriales?",
            answer: "Sí, tenemos una biblioteca completa de tutoriales, webinars semanales y para usuarios Pro ofrecemos sesiones de entrenamiento personalizado con nuestros expertos."
        }
    ];

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

            <div className="min-h-screen bg-gray-50">
                {/* Page Header */}
                <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            ¿Necesitas <span className="text-yellow-400 animate-pulse">Ayuda</span>?
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto">
                            Estamos aquí para resolver todas tus dudas y ayudarte a aprovechar al máximo tu experiencia creativa con IA
                        </p>
                    </div>
                </section>

                {/* Quick Contact Methods */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 fade-in">
                            {[
                                {
                                    icon: '💬',
                                    title: 'Chat en Vivo',
                                    info: 'Respuesta inmediata\n24/7 disponible',
                                    action: 'Iniciar Chat',
                                    href: '#'
                                },
                                {
                                    icon: '📧',
                                    title: 'Email',
                                    info: 'Respuesta en 2-4 horas\nSoporte detallado',
                                    action: 'soporte@artprintsgallery.com',
                                    href: 'mailto:soporte@artprintsgallery.com'
                                },
                                {
                                    icon: '📞',
                                    title: 'Teléfono',
                                    info: 'Lun-Vie 9:00-18:00\nSoporte prioritario',
                                    action: '+34 91 123 45 67',
                                    href: 'tel:+34911234567'
                                },
                                {
                                    icon: '🎥',
                                    title: 'Video Call',
                                    info: 'Planes Pro\nSesiones personalizadas',
                                    action: 'Agendar Llamada',
                                    href: '#'
                                }
                            ].map((method, index) => (
                                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                                    <div className="text-4xl mb-4">{method.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{method.title}</h3>
                                    <p className="text-gray-600 mb-6 whitespace-pre-line">{method.info}</p>
                                    <a
                                        href={method.href}
                                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                    >
                                        {method.action}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Contact Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Contact Form */}
                            <div className="slide-in-left">
                                <h2 className="text-3xl font-bold text-purple-800 mb-8">Envíanos un Mensaje</h2>

                                {showSuccess && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 flex items-center">
                                        <span className="text-2xl mr-3">✅</span>
                                        <span>¡Mensaje enviado correctamente! Te responderemos pronto.</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Empresa
                                            </label>
                                            <input
                                                type="text"
                                                id="empresa"
                                                name="empresa"
                                                value={formData.empresa}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                id="telefono"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="asunto" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tipo de Consulta *
                                        </label>
                                        <select
                                            id="asunto"
                                            name="asunto"
                                            value={formData.asunto}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Selecciona una opción</option>
                                            <option value="soporte-tecnico">Soporte Técnico</option>
                                            <option value="ventas">Información de Ventas</option>
                                            <option value="facturacion">Facturación</option>
                                            <option value="partnerships">Partnerships</option>
                                            <option value="prensa">Prensa</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mensaje *
                                        </label>
                                        <textarea
                                            id="mensaje"
                                            name="mensaje"
                                            value={formData.mensaje}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder="Cuéntanos cómo podemos ayudarte..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        Enviar Mensaje
                                    </button>
                                </form>
                            </div>

                            {/* Contact Information */}
                            <div className="slide-in-right">
                                <h3 className="text-2xl font-bold text-gray-800 mb-8">Información de Contacto</h3>

                                <div className="space-y-8">
                                    {[
                                        {
                                            icon: '📍',
                                            title: 'Oficina Principal',
                                            content: 'Calle Gran Vía, 28\n28013 Madrid, España'
                                        },
                                        {
                                            icon: '🌍',
                                            title: 'Disponibilidad',
                                            content: 'Servicio global\nSoporte en español e inglés'
                                        },
                                        {
                                            icon: '⚡',
                                            title: 'Tiempo de Respuesta',
                                            content: 'Email: 2-4 horas\nChat: Inmediato'
                                        },
                                        {
                                            icon: '🔒',
                                            title: 'Privacidad',
                                            content: 'Comunicación segura\nDatos protegidos'
                                        },
                                        {
                                            icon: '💼',
                                            title: 'Soporte Enterprise',
                                            content: 'Dedicado para planes Pro\nAccount Manager asignado'
                                        }
                                    ].map((info, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="text-3xl">{info.icon}</div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-2">{info.title}</h4>
                                                <p className="text-gray-600 whitespace-pre-line">{info.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Departments */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">
                                Contacta el <span className="text-purple-600">Departamento</span> Correcto
                            </h2>
                            <p className="text-xl text-gray-600">
                                Dirígete directamente al equipo que mejor puede ayudarte
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {departments.map((dept, index) => (
                                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 fade-in text-center">
                                    <div className="text-4xl mb-4">{dept.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">{dept.title}</h3>
                                    <p className="text-gray-600 mb-6">{dept.description}</p>
                                    <a
                                        href={`mailto:${dept.email}`}
                                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                                    >
                                        {dept.email}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 fade-in">
                            <h2 className="text-4xl font-bold mb-4 text-gray-800">
                                Preguntas <span className="text-purple-600">Frecuentes</span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Encuentra respuestas rápidas a las consultas más comunes
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-gray-50 rounded-xl p-6 fade-in">
                                    <button
                                        className="w-full flex justify-between items-center text-left"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span className="text-lg font-semibold text-gray-800">{faq.question}</span>
                                        <span className="text-2xl text-purple-600 transform transition-transform duration-300">
                                            {openFaq === index ? '−' : '+'}
                                        </span>
                                    </button>

                                    {openFaq === index && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Business Hours & Location */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="slide-in-left">
                                <h3 className="text-2xl font-bold text-gray-800 mb-8">Horarios de Atención</h3>

                                <div className="space-y-4 mb-8">
                                    {[
                                        { day: 'Lunes - Viernes', time: '09:00 - 18:00' },
                                        { day: 'Sábado', time: '10:00 - 14:00' },
                                        { day: 'Domingo', time: 'Cerrado' },
                                        { day: 'Chat en Vivo', time: '24/7' },
                                        { day: 'Soporte Urgente', time: '24/7 (Plan Pro)' }
                                    ].map((schedule, index) => (
                                        <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">
                                            <span className="font-semibold text-gray-700">{schedule.day}</span>
                                            <span className="text-gray-600">{schedule.time}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                    <h4 className="text-purple-700 font-bold mb-3">🎯 Tiempo de Respuesta</h4>
                                    <div className="text-sm text-gray-700">
                                        <p><strong>Email:</strong> 2-4 horas</p>
                                        <p><strong>Chat:</strong> &lt; 2 minutos</p>
                                        <p><strong>Teléfono:</strong> Inmediato</p>
                                    </div>
                                </div>
                            </div>

                            <div className="slide-in-right">
                                <h3 className="text-2xl font-bold text-gray-800 mb-8">Oficinas</h3>

                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-lg font-semibold text-purple-700 mb-3">🏢 Madrid - Oficina Principal</h4>
                                        <p className="text-gray-700 mb-4">
                                            Calle Gran Vía, 28<br />
                                            28013 Madrid, España<br />
                                            <strong>Tel:</strong> +34 91 123 45 67
                                        </p>
                                        <a
                                            href="https://maps.google.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold"
                                        >
                                            📍 Ver en Google Maps →
                                        </a>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-semibold text-purple-700 mb-3">🌍 Oficina Virtual - Global</h4>
                                        <p className="text-gray-700 mb-6">
                                            Soporte remoto 24/7<br />
                                            Disponible en español e inglés<br />
                                            <strong>Email:</strong> global@artprintsgallery.com
                                        </p>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <h4 className="text-green-700 font-bold mb-3">💼 Información Legal</h4>
                                        <div className="text-sm text-gray-700">
                                            <p><strong>CIF:</strong> B12345678</p>
                                            <p><strong>Registro Mercantil:</strong> Madrid</p>
                                            <p><strong>GDPR Compliance:</strong> ✓ Certificado</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Media */}
                <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <div className="container mx-auto px-4 text-center fade-in">
                        <h2 className="text-4xl font-bold mb-4">
                            Síguenos en <span className="text-yellow-400">Redes Sociales</span>
                        </h2>
                        <p className="text-xl text-gray-200 mb-12">
                            Mantente al día con las últimas novedades, tutoriales y inspiración creativa
                        </p>

                        <div className="flex justify-center space-x-6 mb-16">
                            {[
                                { icon: '🐦', title: 'Twitter' },
                                { icon: '📸', title: 'Instagram' },
                                { icon: '💼', title: 'LinkedIn' },
                                { icon: '🎬', title: 'YouTube' },
                                { icon: '🎵', title: 'TikTok' },
                                { icon: '🎮', title: 'Discord' }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    title={social.title}
                                    className="text-4xl hover:scale-110 transition-transform duration-300"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        {/* Newsletter Signup */}
                        <div className="max-w-lg mx-auto">
                            <h3 className="text-2xl font-bold mb-4">📧 Newsletter Semanal</h3>
                            <p className="text-gray-200 mb-6">
                                Recibe tips, tutoriales y las últimas funcionalidades directamente en tu email
                            </p>

                            <form onSubmit={handleNewsletterSubmit} className="flex gap-4">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${newsletterSubmitted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                        }`}
                                >
                                    {newsletterSubmitted ? '¡Suscrito! ✓' : 'Suscribirme'}
                                </button>
                            </form>

                            <p className="text-sm text-gray-300 mt-4">
                                No spam. Puedes darte de baja cuando quieras.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
} 