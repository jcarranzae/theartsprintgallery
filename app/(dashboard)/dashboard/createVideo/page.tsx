import VideoForm from '@/components/ui/VideoForm';

export default function HomePage() {
  return (
    <section>
      <div className="container mx-auto px-4 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl"
            style={{
              background: "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 10px #8C1AD9",
              letterSpacing: "0.02em",
            }}>
            Genera Videos con IA
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-[#8C1AD9] sm:text-center sm:text-2xl">
            Crea videos únicos usando AILM
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8">
        <VideoForm />
      </div>
    </section>
  );
}