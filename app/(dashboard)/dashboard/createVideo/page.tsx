import VideoForm from '@/components/ui/VideoForm';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h1 className="text-2xl font-bold text-center mb-4">
          Generar Video con AILM
        </h1>
        <VideoForm />
      </div>
    </main>
  );
}