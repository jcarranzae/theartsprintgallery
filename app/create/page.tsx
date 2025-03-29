import ModelCreate from '@/components/ui/ModelCreate/';
import { redirect } from 'next/navigation'
//import { createClient } from '@/utils/supabase/static-props'
/*import {
  getUser
} from '@/utils/supabase/queries';*/


export default async function Account() {
 /* const supabase = await createClient();
  
  const [user] = await Promise.all([
    getUser(supabase)
  ]);

  if (!user) {
    return redirect('/signin');
  }*/

  return (
    <section>
      <div className="container mx-auto px-4 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            Create AI images
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl sm:text-center sm:text-2xl">
            We use Flux models for the better results.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <ModelCreate />
      </div>
    </section>
  );
}
