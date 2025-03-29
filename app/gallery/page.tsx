//import Gallery from '@/components/ui/Gallery/Gallery'; 
import Gallery from "@/components/ui/Gallery/Gallery";

export default async function MGallery(){
    return (
        <div className='bg-emerald-200'>
            <h1 className='text-center text-3xl font-extrabold p-10'>Gallery</h1>
            <div className="flex">
                <Gallery />
            </div>
        </div>
    );
}