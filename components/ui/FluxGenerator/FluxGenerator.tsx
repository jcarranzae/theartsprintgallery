"use client";

import { useState } from "react";
import ModelSelector from "./ModelSelector";
import ImageUploader from "./ImageUploader";
import PromptInput from "./PromptInput";
import AdvancedSettings from "./AdvancedSettings";
import ImageViewer from "./ImageViewer";
import SaveButton from "../saveButton";

interface FormState {
  model: string;
  prompt: string;
  negativePrompt: string;
  steps: number;
  guidance: number;
  seed: number | null;
  outputFormat: "jpeg" | "png";
  promptUpsampling: boolean;
  imageFile: File | null;
  raw?: boolean; // solo para algunos modelos
}

export default function FluxGenerator() {
  const [form, setForm] = useState<FormState>({
    model: "flux-1-schnell",
    prompt: "",
    negativePrompt: "",
    steps: 30,
    guidance: 30,
    seed: null,
    outputFormat: "jpeg",
    promptUpsampling: false,
    imageFile: null,
    raw: false,
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setGeneratedImage(null);
    setImageId(null);

    try {
      let controlImageBase64 = null;

      if (form.imageFile) {
        const reader = new FileReader();
        const fileReadPromise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = () => reject("Error leyendo imagen");
        });
        reader.readAsDataURL(form.imageFile);
        controlImageBase64 = await fileReadPromise;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: form.model,
          prompt: form.prompt,
          negative_prompt: form.negativePrompt || undefined,
          steps: form.steps,
          guidance: form.guidance,
          seed: form.seed,
          output_format: form.outputFormat,
          prompt_upsampling: form.promptUpsampling,
          image: controlImageBase64 || null,
          raw: form.model.includes("flux-pro-1.1") ? form.raw : undefined,
        }),
      });

      if (!response.ok) throw new Error("Error en la generación");

      const data = await response.json();

      // Polling a /api/check-image/[id]
      let attempts = 0;
      while (attempts < 10) {
        const poll = await fetch(`/api/check-image/${data.id}`);
        const pollResult = await poll.json();

        if (pollResult.completed && pollResult.sample) {
          setGeneratedImage(`data:image/jpeg;base64,${pollResult.sample}`);
          setImageId(data.id);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (attempts === 10) throw new Error("Imagen no disponible después de varios intentos");

    } catch (err) {
      console.error("Error generando imagen:", err);
      alert("Hubo un error generando la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#060826] via-[#121559] to-[#2C2A59] p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#8C1AD9] text-center mb-4">FLUX Generator</h1>

        <ModelSelector value={form.model} onChange={(val) => setForm((prev) => ({ ...prev, model: val }))} />

        <PromptInput
          prompt={form.prompt}
          negativePrompt={form.negativePrompt}
          onChangePrompt={(val) => setForm((prev) => ({ ...prev, prompt: val }))}
          onChangeNegativePrompt={(val) => setForm((prev) => ({ ...prev, negativePrompt: val }))}
        />

        <ImageUploader
          imageFile={form.imageFile}
          setImageFile={(file) => setForm((prev) => ({ ...prev, imageFile: file }))}
        />

        <AdvancedSettings
          show={true}
          onToggle={() => {}}
          steps={form.steps}
          guidance={form.guidance}
          seed={form.seed}
          outputFormat={form.outputFormat}
          promptUpsampling={form.promptUpsampling}
          raw={form.raw}
          model={form.model}
          onChange={(field, value) => setForm(prev => ({ ...prev, [field]: value }))}
          showAspectRatio={false}
          showNegativePrompt={false}
          showWidth={false}
          showHeight={false}
        />

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !form.prompt.trim()}
            className="bg-[#8C1AD9] hover:bg-[#1C228C] transition-colors px-6 py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Generando..." : "Generar Imagen"}
          </button>
        </div>

        {generatedImage && (
          <div className="mt-8 space-y-4">
            <ImageViewer imageUrl={generatedImage} />
            {imageId && (
              <div className="flex justify-center">
                <SaveButton
                  onClick={() => {}}
                  loading={false}
                  label="Guardar imagen"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
