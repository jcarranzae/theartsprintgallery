// pages/index.tsx
// pages/index.tsx
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-placeholder.jpg')" }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded-2xl text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-400 mb-4">
            Rompe Esquemas, Crea sin Límites
          </h1>
          <p className="text-lg md:text-2xl mb-8">
            Bienvenido a The Art Prints Gallery: tu estudio de arte futurista
            impulsado por IA.
          </p>
          <Button className="bg-green-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-300">
            Empezar Ahora
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-2xl hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-4 text-green-400">
              Velocidad Creativa
            </h3>
            <p className="mb-6">
              Convierte tu idea en obra en segundos con IA generativa de última
              generación.
            </p>
            <Button variant="outline" className="border-green-400 text-green-400">
              Descubre Más
            </Button>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-4 text-green-400">
              Versatilidad Multimedia
            </h3>
            <p className="mb-6">
              Imágenes, videos, audio y más: explora todos los formatos en un solo
              lugar.
            </p>
            <Button variant="outline" className="border-green-400 text-green-400">
              Descubre Más
            </Button>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-4 text-green-400">
              Comunidad Rebelde
            </h3>
            <p className="mb-6">
              Únete a una tribu global de creadores que desafían lo establecido.
            </p>
            <Button variant="outline" className="border-green-400 text-green-400">
              Descubre Más
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
              De la Idea a la Realidad
            </h2>
            <p className="mb-6">
              Observa en tiempo real cómo tu concepto cobra vida en un entorno
              urbano-distópico creado por IA.
            </p>
            <Button className="bg-green-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-300">
              Ver Demostración
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/demo-placeholder.jpg"
              alt="Demostración IA"
              width={800}
              height={600}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-12">
            Galería de la Revolución
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['/user1.jpg', '/user2.jpg', '/user3.jpg', '/user4.jpg'].map((src) => (
              <Image
                key={src}
                src={src}
                alt="Obra de usuario"
                width={300}
                height={200}
                className="rounded-2xl shadow-lg"
              />
            ))}
          </div>
          <div className="mt-8">
            <Button className="bg-green-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-300">
              Explora la Galería
            </Button>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
            Únete a la Tribu Rebelde
          </h2>
          <p className="mb-6">
            Comparte, colabora y crece con miles de creadores que, como tú,
            rechazan lo convencional.
          </p>
          <Button className="bg-green-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-300">
            Únete Ahora
          </Button>
        </div>
      </section>
    </>
  );
}
