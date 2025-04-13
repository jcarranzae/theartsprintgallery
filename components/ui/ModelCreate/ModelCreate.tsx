'use client';

import { useState, useRef } from 'react';
import { imageService } from '@/services/imageService';
import { GenerateImageRequest, MODELS, ModelType, FluxProRequest, FluxProUltraRequest } from '@/types/api';
import { ASPECT_RATIOS } from '@/config/constants';

//import { redirect } from 'next/navigation'

//import { createClient } from '@/utils/supabase/client'

export default function Home() {
  //const supabase = await createClient()

  /*const { data, error: authError } = await supabase.auth.getUser()
  if (authError || !data?.user) {
    redirect('/signin')
  }*/
  
  const [selectedModel, setSelectedModel] = useState<ModelType>(MODELS.FLUX_PRO);
  
  const [formData, setFormData] = useState<FluxProRequest | FluxProUltraRequest>({
    // Valores iniciales para Flux Pro
    prompt: '',
    image_prompt: null,
    width: 1024,
    height: 768,
    steps: 28,
    prompt_upsampling: false,
    seed: 42,
    guidance: 3,
    safety_tolerance: 2,
    output_format: 'jpeg'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Removemos el prefijo "data:image/...;base64," del string
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await convertToBase64(file);
        setFormData(prev => ({
          ...prev,
          image_prompt: base64String
        }));
      } catch (error) {
        console.error('Error al convertir imagen:', error);
        setError('Error al procesar la imagen');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        image_prompt: null
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = name === 'guidance' ? parseFloat(value) : parseInt(value);
    } else {
      finalValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as ModelType;
    setSelectedModel(newModel);
    
    // Resetear el formulario según el modelo seleccionado
    if (newModel === MODELS.FLUX_PRO) {
      setFormData({
        prompt: '',
        image_prompt: null,
        width: 1024,
        height: 768,
        steps: 28,
        prompt_upsampling: false,
        seed: 42,
        guidance: 3,
        safety_tolerance: 2,
        output_format: 'jpeg'
      });
    } else {
      setFormData({
        prompt: '',
        image_prompt: null,
        seed: 42,
        aspect_ratio: '16:9',
        safety_tolerance: 2,
        output_format: 'jpeg',
        raw: false,
        image_prompt_strength: 0.1
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    //console.log('📤 Datos enviados al servidor:', formData);

    try {
      const response = await imageService.generateImage(formData, selectedModel);
      //console.log('📥 Respuesta inicial de la API:', response);

      const result = await imageService.pollImageResult(response.id);
      //console.log('🖼️ Resultado final con URL:', result);
      
      setImageUrl(result.url || null);
    } catch (err) {
      //console.error('❌ Error en la petición:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch('./api/save-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Imagen guardada correctamente');
      } else {
        throw new Error('Error al guardar la imagen');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la imagen');
    }
  };

  const isFluxProRequest = (data: FluxProRequest | FluxProUltraRequest): data is FluxProRequest => {
    return 'width' in data;
  };

  return (
      <div className='columns-2 flex justify-start'>
        <div className="w-full max-w-1/2">
          <form onSubmit={handleSubmit}>
            {/* Selector de modelo */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium mb-2">
                Modelo
              </label>
              <select 
                className="select select-secondary w-full max-w-xs" 
                id="model"
                value={selectedModel}
                onChange={handleModelChange}
              >
                <option disabled selected>Pick your favorite model</option>
                <option value={MODELS.FLUX_PRO}>Flux Pro</option>
                <option value={MODELS.FLUX_PRO_ULTRA}>Flux Pro Ultra</option>
              </select>
            </div>

            {/* Campos comunes y específicos en orden */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Descripción de la imagen
              </label>
              <textarea 
                className="textarea textarea-bordered textarea-secondary w-full" 
                placeholder="Describe the image you want to create"
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
              />
            </div>

            {/* Seed */}
            <div>
              <label htmlFor="seed" className="block text-sm font-medium mb-2">
                Seed (opcional)
              </label>
              <input
                type="number"
                id="seed"
                name="seed"
                value={formData.seed || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="42"
              />
            </div>

            {selectedModel === MODELS.FLUX_PRO_ULTRA && !isFluxProRequest(formData) && (
              <>
                <div>
                  <label htmlFor="aspect_ratio" className="block text-sm font-medium mb-2">
                    Proporción de aspecto
                  </label>
                  <select 
                    id="aspect_ratio"
                    name="aspect_ratio"
                    value={(formData as FluxProUltraRequest).aspect_ratio}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >                
                    {ASPECT_RATIOS.map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                      ))}
                  </select>
                </div>

                {/* Safety Tolerance */}
                <div>
                  <label htmlFor="safety_tolerance" className="block text-sm font-medium mb-2">
                    Nivel de Tolerancia (0-6)
                  </label>

                  <input
                    type="number"
                    id="safety_tolerance"
                    name="safety_tolerance"
                    min="0"
                    max="6"
                    value={formData.safety_tolerance}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <label htmlFor="output_format" className="block text-sm font-medium mb-2">
                    Formato de Salida
                  </label>
                  <select 
                    id="output_format"
                    name="output_format"
                    value={formData.output_format}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="raw" className="flex items-center">
                  <div className="form-control">
                    <label className="cursor-pointer label">
                      <input 
                      type="checkbox"
                      id="raw"
                      name="raw"
                      checked={(formData as FluxProUltraRequest).raw}
                      onChange={handleChange}
                      className="checkbox checkbox-secondary" />
                    </label>
                  </div>
                    <span className="text-sm font-medium">
                      RAW
                    </span>
                  </label>
                </div>

                {/* Image Prompt */}
                <div>
                  <label htmlFor="image_prompt" className="block text-sm font-medium mb-2">
                    Imagen Base (opcional)
                  </label>
                  <input
                    type="file"
                    id="image_prompt"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
                  />
                  {formData.image_prompt && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image_prompt: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Eliminar imagen
                    </button>
                  )}
                </div>

                {formData.image_prompt && (
                  <div>
                    <label htmlFor="image_prompt_strength" className="block text-sm font-medium mb-2">
                      Fuerza de la imagen base (0-1)
                    </label>
                    <input
                      type="range"
                      id="image_prompt_strength"
                      name="image_prompt_strength"
                      min="0"
                      max="1"
                      step="0.1"
                      value={(formData as FluxProUltraRequest).image_prompt_strength}
                      onChange={handleChange}
                      className="range range-secondary"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {(formData as FluxProUltraRequest).image_prompt_strength}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Campos específicos de Flux Pro */}
            {selectedModel === MODELS.FLUX_PRO && isFluxProRequest(formData) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="width" className="block text-sm font-medium mb-2">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    min="256"
                    max="1440"
                    step="32"
                    value={formData.width}
                    onChange={handleChange}
                    className="input input-bordered input-secondary w-full max-w-xs"
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-sm font-medium mb-2">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    min="256"
                    max="1440"
                    step="32"
                    value={formData.height}
                    onChange={handleChange}
                    className="input input-bordered input-secondary w-full max-w-xs"
                  />
                </div>
              </div>
            )}

            {/* Prompt Upsampling - solo para Flux Pro */}
            {selectedModel === MODELS.FLUX_PRO && isFluxProRequest(formData) && (
                <div className="form-control">
                  <label className="cursor-pointer label">
                    <span className="label-text">Activar Prompt Upsampling</span>
                    <input type="checkbox" 
                      id="prompt_upsampling"
                      name="prompt_upsampling"
                      checked={formData.prompt_upsampling}
                      onChange={handleChange} />
                  </label>
                </div>
            )}

            {/* Steps - solo para Flux Pro */}
            {selectedModel === MODELS.FLUX_PRO && isFluxProRequest(formData) && (
              <div>
                <label htmlFor="steps" className="block text-sm font-medium mb-2">
                  Pasos de Generación
                </label>
                <input
                  type="number"
                  id="steps"
                  name="steps"
                  min="1"
                  max="50"
                  value={formData.steps}
                  onChange={handleChange}
                  className="input input-bordered input-secondary w-full max-w-xs"
                />
              </div>
            )}

            {/* Guidance - solo para Flux Pro */}
            {selectedModel === MODELS.FLUX_PRO && isFluxProRequest(formData) && (
              <div>
                <label htmlFor="guidance" className="block text-sm font-medium mb-2">
                  Guidance Scale
                </label>
                <input
                  type="number"
                  id="guidance"
                  name="guidance"
                  min="1"
                  max="20"
                  step="0.1"
                  value={formData.guidance}
                  onChange={handleChange}
                  className="input input-bordered input-secondary w-full max-w-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-active btn-primary mt-4"
            >
              {loading ? 'Generando...' : 'Generar Imagen'}
            </button>
          </form>

          {error && (
            <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            </div>
          )}
        </div>

        {/* Columna de la imagen */}
        <div className="w-full max-w-1/2">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Generando imagen...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img
                src={imageUrl}
                alt="Imagen generada"
                className="w-full h-auto rounded-lg"
                onError={(e) => console.error('Error al cargar la imagen:', e)}
              />
              <button 
                onClick={handleSaveImage}
                className="btn btn-active btn-primary"
              >
                Guardar imagen
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                La imagen generada aparecerá aquí
              </p>
            </div>
          )}
        </div>
      </div>

  );
}
