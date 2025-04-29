import VideoForm from '@/components/ui/VideoForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto bg-zinc-900 p-8 rounded-lg shadow-2xl border-2 border-fuchsia-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400">
          Generar Video con AILM
        </h1>
        <VideoForm />
      </div>
    </main>
  );
}