import { createClient } from '@supabase/supabase-js';
import Dgalleryimages from './Dgalleryimages';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function Dgallery() {
    const supabaseAdmin = createClient(
      supabaseUrl || '', supabaseKey || ''
    );

    const { data, error } = await supabaseAdmin
        .storage
        .from("Theartprintgallery_images")
        .list('public', {
            limit: 50,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
    });
    if (!data) {
        return <div>No images found.</div>;
    }

    return (
        <>
            {data.map((image) => (
                <Dgalleryimages key={image.name} image={image} />
            ))}
        </>
    );
}



