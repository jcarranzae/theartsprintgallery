import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            {/* Header */}
            <header className="bg-gray-900 border-b border-green-400/30 fixed w-full top-0 z-50">
                <nav className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <a href="/" className="text-xl font-extrabold text-green-400">
                            The Art Prints Gallery
                        </a>

                        <ul className="hidden md:flex space-x-6">
                            <li>
                                <a href="/contenido" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <a href="/features" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                                    Funciones
                                </a>
                            </li>
                            <li>
                                <a href="/pricing" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                                    Precios
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-300 hover:text-green-400 transition-colors font-medium">
                                    Contacto
                                </a>
                            </li>
                        </ul>

                        <div className="flex items-center space-x-4">
                            <a
                                href="/sign-in"
                                className="bg-green-400 hover:bg-green-300 text-black px-4 py-2 rounded-md font-bold transition-all duration-300"
                            >
                                Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 pt-20">
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 border-t border-green-400/30 text-white mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-green-400">Producto</h3>
                            <div className="space-y-2">
                                <a href="/features" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Funciones
                                </a>
                                <a href="/pricing" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Precios
                                </a>
                                <a href="/api" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    API
                                </a>
                                <a href="/docs" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Documentación
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-green-400">Recursos</h3>
                            <div className="space-y-2">
                                <a href="/blog" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Blog
                                </a>
                                <a href="/tutorials" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Tutorials
                                </a>
                                <a href="/examples" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Ejemplos
                                </a>
                                <a href="/community" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Comunidad
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-green-400">Empresa</h3>
                            <div className="space-y-2">
                                <a href="/about" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Sobre Nosotros
                                </a>
                                <a href="/careers" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Careers
                                </a>
                                <a href="/press" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Prensa
                                </a>
                                <a href="/contact" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Contacto
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-green-400">Soporte</h3>
                            <div className="space-y-2">
                                <a href="/help" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Centro de Ayuda
                                </a>
                                <a href="/status" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Status
                                </a>
                                <a href="/privacy" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Privacidad
                                </a>
                                <a href="/terms" className="block text-gray-300 hover:text-green-400 transition-colors">
                                    Términos
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-green-400/30 mt-8 pt-8 text-center">
                        <p className="text-gray-300">
                            &copy; 2025 The Art Prints Gallery. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 