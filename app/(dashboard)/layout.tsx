// app/layout.tsx
'use client';

import Link from 'next/link';
import { useState, Suspense, use } from 'react';
import { CircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-green-400 hover:text-green-200"
        >
          Pricing
        </Link>
        <Button
          asChild
          className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer h-9 w-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 bg-gray-800 border border-green-400">
        <DropdownMenuItem>
          <Link href="/dashboard" className="flex items-center text-white">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="w-full text-left text-white">Sign out</button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  return (
    <header className="bg-gray-900 border-b border-green-400 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-green-400" />
          <span className="ml-2 text-2xl font-extrabold text-green-400">The Art Prints Gallery</span>
        </Link>
        <nav className="flex space-x-6">
          <Link href="#features" className="text-green-400 hover:text-green-200">Features</Link>
          <Link href="#galeria" className="text-green-400 hover:text-green-200">Galería</Link>
          <Link href="#crear-imagen" className="text-green-400 hover:text-green-200">Crear Imagen</Link>
          <Link href="#comunidad" className="text-green-400 hover:text-green-200">Comunidad</Link>
          <Link href="#blog" className="text-green-400 hover:text-green-200">Blog</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9 w-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-green-400">The Art Prints Gallery</h3>
            <p>© 2025 The Art Prints Gallery. Todos los derechos reservados.</p>
          </div>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-white">Twitter</Link>
            <Link href="#" className="hover:text-white">Instagram</Link>
            <Link href="#" className="hover:text-white">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
