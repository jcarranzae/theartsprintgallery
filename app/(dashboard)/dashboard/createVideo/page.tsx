'use client';

import { useState } from 'react';
import VideoForm from '@/components/ui/VideoForm';
import { VideoRunwayForm } from '@/components/ui/VideoRunway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('text-to-video');

  return (
    <section>
      <div className="container mx-auto px-4 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold sm:text-center sm:text-6xl"
            style={{
              background: "linear-gradient(90deg, #8C1AD9 30%, #2C2A59 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 10px #8C1AD9",
              letterSpacing: "0.02em",
            }}>
            Genera Videos con IA
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-[#8C1AD9] sm:text-center sm:text-2xl">
            Crea videos únicos usando AILM
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8">
        <Tabs defaultValue="text-to-video" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex w-auto space-x-2" style={{ background: "linear-gradient(120deg, #060826 0%, #1C228C 50%, #2C2A59 100%)" }}>
            <TabsTrigger value="text-to-video" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#8C1AD9]/10 data-[state=active]:bg-[#8C1AD9] data-[state=active]:text-white">
              Texto a Video
            </TabsTrigger>
            <TabsTrigger value="image-to-video" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[#8C1AD9]/10 data-[state=active]:bg-[#8C1AD9] data-[state=active]:text-white">
              Imagen a Video
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text-to-video">
            <VideoForm />
          </TabsContent>
          <TabsContent value="image-to-video">
            <VideoRunwayForm />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}