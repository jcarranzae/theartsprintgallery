
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

async function BlogArticleContent({ id }: { id: string }) {
    let data: any = null;
    try {
        const response = await fetch(
            `${supabaseUrl}/rest/v1/blog_posts?select=*,users:user_id(name)&id=eq.${id}&limit=1`,
            {
                headers: {
                    'apikey': supabaseKey || '',
                    'Authorization': `Bearer ${supabaseKey || ''}`,
                    'Accept': 'application/vnd.pgrst.object+json'
                },
                cache: 'no-store'
            }
        );

        if (response.ok) {
            data = await response.json();
        } else {
            console.error('Error fetching blog post:', await response.text());
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }

    if (!data) {
        return <div>No se encontró el artículo.</div>;
    }

    const formattedDate = format(new Date(data.created_at), "d 'de' MMMM 'de' yyyy", { locale: es });

    return (
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
    );
}

export default async function BlogArticle({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <div className="mx-auto max-w-screen-md px-1 py-8">
            <Suspense fallback={<div className="text-center py-20">Cargando artículo...</div>}>
                <BlogArticleContent id={id} />
            </Suspense>
        </div>
    );
}

