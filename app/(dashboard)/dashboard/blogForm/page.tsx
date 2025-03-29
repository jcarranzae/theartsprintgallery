"use client";
import BlogForm from '@/components/ui/BlogForms/BlogForm';

const BlogPage = () => {
  return (
    <section>
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl">
            Blog
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            The blog about creating images with IA.
          </p>
        </div>
      </div>
      <div>
        <BlogForm />
      </div>
    </section>
  );
};

export default BlogPage;
