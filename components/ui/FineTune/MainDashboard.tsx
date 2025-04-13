'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { BFLApi } from '@/lib/auth/api';
import { FinetuneRequest } from '@/types/api';
import axios from 'axios';

export function MainDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<FinetuneRequest>>({
    finetune_comment: '',
    trigger_word: 'TOK',
    mode: 'general',
    iterations: 300,
    learning_rate: 0.00001,
    captioning: true,
    priority: 'quality',
    finetune_type: 'full',
    lora_rank: 32,
  });
  const [serverResponse, setServerResponse] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'range') {
      let numValue = parseFloat(value);
      if (name === 'learning_rate') {
        // Convertir el valor del slider (0-100) a learning rate (0.000001-0.005)
        numValue = (0.005 - 0.000001) * (numValue / 100) + 0.000001;
      }
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast.error('Por favor, selecciona un archivo ZIP');
      return;
    }

    if (!formData.finetune_comment) {
      toast.error('El comentario del finetune es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const api = new BFLApi();
      console.log('Enviando datos al servidor:', formData);
      const response = await api.requestFinetuning(files[0], formData);
      setServerResponse(JSON.stringify(response, null, 2));
      toast.success(`¡Finetune iniciado! ID: ${response.id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerResponse(JSON.stringify(error.response?.data || error.message, null, 2));
      } else {
        setServerResponse(JSON.stringify((error as Error).message, null, 2));
      }
      toast.error('Error al iniciar el finetune');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">BFL Finetune Dashboard</h1>
      
      <div className="flex gap-8">
        {/* Columna del formulario - 50% */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Archivo ZIP */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Archivo ZIP *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".zip"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-xs text-gray-500 mt-1">Archivo ZIP con imágenes de entrenamiento y opcionalmente sus descripciones</p>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Comentario *
                </label>
                <input
                  type="text"
                  name="finetune_comment"
                  value={formData.finetune_comment}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="my-first-finetune"
                  required
                />
              </div>

              {/* Trigger Word */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Palabra Trigger
                </label>
                <input
                  type="text"
                  name="trigger_word"
                  value={formData.trigger_word}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="TOK"
                />
              </div>

              {/* Modo */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Modo *
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="general">General</option>
                  <option value="character">Character</option>
                  <option value="style">Style</option>
                  <option value="product">Product</option>
                </select>
              </div>

              {/* Iteraciones */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Iteraciones: {formData.iterations}
                </label>
                <input
                  type="range"
                  name="iterations"
                  value={formData.iterations}
                  onChange={handleInputChange}
                  min="100"
                  max="1000"
                  step="10"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Learning Rate */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Learning Rate: {(formData.learning_rate ?? 0.00001).toExponential(6)}
                </label>
                <input
                  type="range"
                  name="learning_rate"
                  value={((formData.learning_rate ?? 0.00001 - 0.000001) / (0.005 - 0.000001)) * 100}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.000001</span>
                  <span>0.005</span>
                </div>
              </div>

              {/* Captioning */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="captioning"
                    checked={formData.captioning}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700 text-sm font-bold">Habilitar Captioning</span>
                </label>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Prioridad
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="quality">Quality</option>
                  <option value="speed">Speed</option>
                </select>
              </div>

              {/* Tipo de Finetune */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tipo de Finetune
                </label>
                <select
                  name="finetune_type"
                  value={formData.finetune_type}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="full">Full</option>
                  <option value="lora">LoRA</option>
                </select>
              </div>

              {/* LoRA Rank */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  LoRA Rank
                </label>
                <select
                  name="lora_rank"
                  value={formData.lora_rank}
                  onChange={handleInputChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value={32}>32</option>
                  <option value={16}>16</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {isLoading ? 'Procesando...' : 'Iniciar Finetune'}
              </button>
            </form>
          </div>
        </div>

        {/* Columna de la imagen - 50% */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">Vista Previa</h2>
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                {/* Aquí puedes agregar la lógica para mostrar la imagen */}
                <div className="text-center p-6">
                  <p className="text-gray-500">
                    No hay imagen seleccionada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {serverResponse && (
        <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">
          <pre className="text-sm">{serverResponse}</pre>
        </div>
      )}
    </div>
  );
} 