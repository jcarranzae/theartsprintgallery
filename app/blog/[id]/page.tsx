import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function BlogArticle ({
    params,
  }: {
    params: Promise<{ id: number }>
  }){
    const { id } = await params
    const supabaseAdmin = createClient(
      supabaseUrl || '', supabaseKey || ''
    )
    const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(
        'content'
    )
    .match({ id }).single()
    //.eq('blog_posts.id', id);
    
    if (!data) {
        //console.error(error);
        return <div>No blog articles found.</div>;
    }

    //console.log(data);
    return (
        <div className="mx-auto max-w-screen-md px-4 py-8">
            <article className="prose lg:prose-xl whitespace-pre-wrap">
                {data.content} 
            </article>
                
        </div>
        
    )
}

