import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface BlogPost {
    title: string;
    short_description: string;
    content: string;
    categories: string;
    is_published: boolean;
}

interface BlogFormProps {}

const BlogForm: React.FC<BlogFormProps> = () => {
    const supabaseAdmin = createClient(
        supabaseUrl || '', supabaseKey || ''
    );

    const [title, setTitle] = useState<string>('');
    const [shortDescription, setShortDescription] = useState<string>('');
    const [content, setContent] = useState<string>('');
    //const [categories, setCategories] = useState<string>('');
    const [isPublished, setIsPublished] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { data, error } = await supabaseAdmin
            .from('blog_posts')
            .insert([
                { title: title, short_description: shortDescription, content: content, published: isPublished }
            ]);

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log('Data inserted successfully:', data);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <label>Short Description:</label>
                <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
            </div>
            <div>
                <label>Content:</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <div>
                <label>Publish:</label>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default BlogForm;
