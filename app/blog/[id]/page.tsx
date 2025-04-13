import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function BlogArticle({
    params,
}: {
    params: { id: number }
}) {
    const { id } = params;
    const supabaseAdmin = createClient(
        supabaseUrl || '', supabaseKey || ''
    );

    const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select(`
            *,
            users:user_id (
                name
            )
        `)
        .eq('id', id)
        .single();

    if (!data) {
        return <div>No se encontró el artículo.</div>;
    }

    const formattedDate = format(new Date(data.created_at), "d 'de' MMMM 'de' yyyy", { locale: es });

    return (
        <div className="mx-auto max-w-screen-md px-1 py-8">
            <article className="prose lg:prose-xl dark:prose-invert">
                <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8">
                    <span>Por {data.users?.name || 'Autor desconocido'}</span>
                    <span>•</span>
                    <span>Publicado el {formattedDate}</span>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{data.short_description}</p>
                <div 
                    className="blog-content [&>p]:mb-8 [&>p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </article>
        </div>
    );
}

