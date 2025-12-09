import Blog from "@/components/ui/Blog/Blog"
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

const Gallery = () => {
    return (
        <div className="bg-emerald-100 py-24 sm:py-32">
            <Suspense fallback={<div className="text-center">Loading articles...</div>}>
                <Blog />
            </Suspense>
        </div>
    );
}

export default Gallery;