
interface Article {
    id: number;
    title: string;
    short_description: string;
    created_at: string;
    users: {
        id: number;
        name: string;
       // avatar_url: string;
    }
}

const BlogItem = ({ article }: { article: Article }) => {
    //console.log(article.users.full_name );
    return (
        <div className="mt-10 pt-10">
            <article className="flex mr-4 max-w-xl flex-col items-start justify-between border border-emerald-500 rounded-md pr-4">
                <div className="flex items-center gap-x-4 text-xs pl-2 pt-2">
                    <time dateTime="2020-03-16" className="text-gray-500">{article.created_at}</time>
                    <a href='#' className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">Marketing</a>
                </div>
                <div className="group relative pl-2">
                    <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                    <a href={`/blog/${article.id}`}>
                        <span className="absolute inset-0"></span>
                        {article.title}
                    </a>
                    </h3>
                    <p className="mt-5 pl-2 line-clamp-3 text-sm/6 text-gray-600">{article.short_description}</p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4 pl-4">
                    
                    <div className="text-sm/6 pb-4">
                    <p className="font-semibold text-gray-900">
                        <a href="#">
                        <span className="absolute inset-0"></span>
                        {article.users.name}
                        </a>
                    </p>
                    <p className="text-gray-600">Co-Founder / CTO</p>
                    </div>
                </div>
            </article>
        </div>
    )
}

export default BlogItem;

