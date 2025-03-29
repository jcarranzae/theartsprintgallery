import { createClient } from '@supabase/supabase-js';
import BlogItem from './BlogItem'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function Blog() {
    const supabaseAdmin = createClient(
      supabaseUrl || '', supabaseKey || ''
    )
    const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(
        `id, user_id,title,short_description,created_at,
        users!blog_posts_user_id_fkey!
        users(
            id, name)`
    );

    if (!data) {
        //console.error(error);
        return <div>No blog articles found.</div>;
    }
    //console.log(data);
    return (
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto">
                    <h2 className="text-4xl text-center font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">From the blog</h2>
                    <p className="mt-2 text-lg/8 text-gray-600 text-center">Learn how to grow your business with our expert advice.</p>
                </div>
                <div className='flex'>
                    {data.map((article) => (
                        <BlogItem key={article.id} article={article} />
                    ))}
                </div>
            </div>
    )
}
