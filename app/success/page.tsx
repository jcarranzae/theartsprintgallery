interface SuccessPageProps {
    searchParams: {
      videoUrl?: string;
    };
  }
  
  export default function SuccessPage({ searchParams }: SuccessPageProps) {
    const { videoUrl } = searchParams;
  
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">¡Video Generado!</h1>
  
        {videoUrl ? (
          <div className="w-full max-w-2xl">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full border rounded"
            />
          </div>
        ) : (
          <p className="text-red-500">No se encontró el enlace del video.</p>
        )}
  
        <a
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded"
        >
          Generar Otro Video
        </a>
      </main>
    );
  }