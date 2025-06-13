// app/(dashboard)/dashboard/layout.tsx
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

function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-800 border-r border-green-400/30 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-green-400 mb-4">🎨 AI Generators</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard/kontext"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🎯</span>
            <div>
              <div className="font-medium">Flux Kontext</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Advanced contextual images</div>
            </div>
          </Link>

          <Link
            href="/dashboard/kling"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🎬</span>
            <div>
              <div className="font-medium">Kling Video (T2V)</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Text-to-video generation</div>
            </div>
          </Link>

          <Link
            href="/dashboard/kling/image-to-video"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🖼️➡️🎬</span>
            <div>
              <div className="font-medium">Kling I2V</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Image-to-video generation</div>
            </div>
          </Link>

          <Link
            href="/dashboard/kling/test"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🧪</span>
            <div>
              <div className="font-medium">Kling Test Suite</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">API testing & diagnostics</div>
            </div>
          </Link>
        </nav>

        <h2 className="text-lg font-semibold text-green-400 mb-4 mt-8">📊 Management</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard/gallery"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🖼️</span>
            <div>
              <div className="font-medium">Gallery</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Browse your creations</div>
            </div>
          </Link>

          <Link
            href="/dashboard/kling/history"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">🎥</span>
            <div>
              <div className="font-medium">Video History</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Your Kling generations</div>
            </div>
          </Link>

          <Link
            href="/dashboard/history"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">📜</span>
            <div>
              <div className="font-medium">Generation History</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">All generations</div>
            </div>
          </Link>
        </nav>

        <h2 className="text-lg font-semibold text-green-400 mb-4 mt-8">⚙️ Settings</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span className="text-xl">⚙️</span>
            <div>
              <div className="font-medium">Settings</div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">Account & preferences</div>
            </div>
          </Link>
        </nav>

        {/* Quick Info Panel */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
          <h3 className="text-purple-300 font-semibold text-sm mb-2">🆕 New: Kling I2V</h3>
          <p className="text-xs text-gray-300 mb-3">
            Transform static images into dynamic videos with advanced motion control, Motion Brush, and camera movements.
          </p>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>End frame control</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Motion Brush (Static/Dynamic)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Advanced camera controls</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
      <footer className="bg-gray-900 text-gray-400 py-8 ml-64">
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