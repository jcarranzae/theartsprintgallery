
// Ensure this file exports a component
interface ImageProps {
  name: string;
}

const Dgalleryimages = ({ image }: { image: ImageProps }) => {
    return (
      <div>
        <img className="h-auto max-w-full rounded-lg object-cover object-center"
        src={`${process.env.SUPABASE_URL}/storage/v1/object/public/Theartprintgallery_images/public/${image.name}`}
        width={400}
        alt="gallery-photo" />
      </div>
    );
  };
  
  export default Dgalleryimages;
