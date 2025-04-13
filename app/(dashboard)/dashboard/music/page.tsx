import MusicForm from '@/components/ui/MusicForm/MusicForm';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function MusicPage() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return redirect('/signin');
  }

  return (
    <section>
      <div className="container mx-auto px-4 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            Genera Música con IA
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl sm:text-center sm:text-2xl">
            Crea música única usando Stable Audio
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <MusicForm />
      </div>
    </section>
  );
} 