'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, Shield, Activity, Menu, Video, Rss, 
  ImageUpscale, ImagePlus, Camera, Music, Scaling, 
  Image as ImageIcon, FolderOpen, ChevronLeft, Terminal 
} from 'lucide-react';

import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Settings, label: 'Panel Principal' },
    { href: '/dashboard/activity', icon: Activity, label: 'Actividad' },
    { href: '/dashboard/blogForm', icon: Rss, label: 'Blog' },
    { href: '/dashboard/createVideo', icon: Video, label: 'Generador de Video' },
    { href: '/dashboard/createImage', icon: Camera, label: 'Generador de Imágenes' },
    { href: '/dashboard/music', icon: Music, label: 'Generador de Música' },
    { href: '/dashboard/tools/canny', icon: Scaling, label: 'Canny' },
    { href: '/dashboard/tools/fill', icon: Scaling, label: 'Relleno de Imágenes' },
    { href: '/dashboard/tools/finetune', icon: Scaling, label: 'Finetune' },
    { href: '/dashboard/imageScaler', icon: Scaling, label: 'Escalador de Imágenes' },
    { href: '/dashboard/promptGenerator', icon: Terminal, label: 'Generador de Prompts' },
    { href: '/dashboard/gallery', icon: FolderOpen, label: 'Galería Multimedia' },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(120deg, #060826 0%, #1C228C 50%, #2C2A59 100%)",
      }}
    >
      {/* SIDEBAR */}
      <aside
        className={cn(
          "transition-all duration-300 h-screen relative z-20",
          collapsed ? "w-20" : "w-64"
        )}
        style={{
          background: "linear-gradient(180deg, #121559 0%, #8C1AD9 100%)",
          boxShadow: "2px 0 16px 0 rgba(140,26,217,0.08)",
          borderRight: "2px solid #2C2A59",
        }}
      >
        {/* Botón colapsar menú */}
        <button
          className={cn(
            "absolute top-4 right-[-18px] w-8 h-8 rounded-full bg-[#8C1AD9] flex items-center justify-center shadow-xl border-2 border-[#2C2A59] z-30 transition-transform duration-300",
            collapsed ? "rotate-[-90deg]" : "rotate-0"
          )}
          style={{
            boxShadow: "0 0 20px 2px #8C1AD9, 0 2px 10px 2px #06082655",
          }}
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Abrir menú" : "Cerrar menú"}
        >
          <span
            className="block transition-transform"
            style={{
              transform: collapsed ? "rotate(90deg)" : "rotate(0deg)",
              color: "#fff",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20">
              <polygon
                points="7,5 13,10 7,15"
                fill="#fff"
                style={{
                  filter: "drop-shadow(0 0 2px #8C1AD9)",
                  transition: "transform 0.3s"
                }}
              />
            </svg>
          </span>
        </button>

        {/* Navegación */}
        <nav className="mt-16 flex flex-col gap-3 px-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "cursor-pointer shadow-none font-semibold flex items-center gap-3 px-3 py-2 w-full border border-transparent transition-all",
                  collapsed ? "justify-center px-0" : "justify-start px-3",
                  pathname === item.href
                    ? "bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white"
                    : "bg-[#121559] text-[#8C1AD9] hover:bg-[#1C228C] hover:text-white",
                  "hover:scale-105",
                  "hover:cursor-pointer"
                )}
                style={{
                  borderRadius: "12px",
                  boxShadow:
                    pathname === item.href
                      ? "0 0 16px 3px #8C1AD9"
                      : "0 2px 12px 0 #06082644",
                }}
              >
                <item.icon
                  className={`h-5 w-5 ${pathname === item.href ? "text-white" : "text-[#8C1AD9]"}`}
                />
                {!collapsed && (
                  <span className="tracking-wide transition-all duration-300 select-none">
                    {item.label}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main
        className="flex-1 min-h-screen flex flex-col items-stretch p-0"
        style={{
          background: "linear-gradient(120deg, #060826 0%, #1C228C 100%)",
          color: "#fff",
        }}
      >
        {/* CABECERA GENERAL */}
        <header
          className="w-full py-8 px-12 mb-6"
          style={{
            background:
              "linear-gradient(90deg, #060826 60%, #8C1AD9 100%)",
            borderBottom: "2px solid #2C2A59",
            boxShadow: "0 6px 30px 0 #8C1AD980",
          }}
        >
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 10px #8C1AD9",
              letterSpacing: "0.02em",
            }}
          >
            AI Tools Suite
          </h1>
        </header>

        {/* CONTENIDO */}
        <div
          className="flex-1 flex flex-col px-8 py-8"
          style={{
            background:
              "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            borderRadius: "24px",
            boxShadow: "0 4px 48px 0 #8C1AD944",
            minHeight: "80vh",
            maxWidth: "100vw",
          }}
        >
          {/* Si tus páginas tienen títulos secundarios, usa esto: */}
          {/* <h2 className="text-2xl font-semibold mb-8"
              style={{
                color: "#8C1AD9",
                textShadow: "0 0 6px #8C1AD9",
                letterSpacing: "0.02em",
              }}>
              Título de sección
            </h2> */}
          {children}
        </div>
      </main>
    </div>
  );
}
