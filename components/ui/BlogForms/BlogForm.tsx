'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from 'lucide-react';
import { toast } from "sonner";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

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
    const [isPublished, setIsPublished] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data, error } = await supabaseAdmin
                .from('blog_posts')
                .insert([
                    { 
                        title: title, 
                        short_description: shortDescription, 
                        content: content,
                        published: isPublished,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                throw error;
            }

            toast.success('Artículo guardado exitosamente');
            // Limpiar el formulario
            setTitle('');
            setShortDescription('');
            setContent('');
            setIsPublished(false);
        } catch (error) {
            console.error('Error al guardar el artículo:', error);
            toast.error('Error al guardar el artículo');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Crear Nuevo Artículo</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ingresa el título del artículo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción Corta</Label>
                        <Textarea
                            id="description"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="Escribe una breve descripción del artículo"
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Contenido</Label>
                        <div className="border rounded-md">
                            <JoditEditor
                                value={content}
                                onChange={(newContent) => setContent(newContent)}
                                config={{
                                    height: 400,
                                    placeholder: 'Escribe el contenido de tu artículo aquí...',
                                    toolbarAdaptive: false,
                                    buttons: [
                                        'bold', 'italic', 'underline', 'strikethrough',
                                        '|', 'ul', 'ol', '|', 'outdent', 'indent',
                                        '|', 'font', 'fontsize', 'brush', 'paragraph',
                                        '|', 'image', 'table', 'link', '|', 'align',
                                        'undo', 'redo'
                                    ]
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="publish"
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                        <Label htmlFor="publish">Publicar inmediatamente</Label>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Artículo
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default BlogForm;
