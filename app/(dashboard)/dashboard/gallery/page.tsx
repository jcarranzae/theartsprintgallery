'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ImageIcon, Search, Calendar, X } from 'lucide-react';

interface ImageData {
  id: number;
  url: string;
  prompt: string;
  original_name: string;
  created_at: string;
  image_id: string | null;
  likes: number;
}

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Estados de filtros - separar el input del valor real de búsqueda
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Estados para date inputs (locales, no disparan búsqueda)
  const [dateFromInput, setDateFromInput] = useState(searchParams.get('dateFrom') || '');
  const [dateToInput, setDateToInput] = useState(searchParams.get('dateTo') || '');

  // Estados para filtros de fecha reales (disparan búsqueda)
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollRestored = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Actualizar URL con parámetros
  const updateURL = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/dashboard/gallery${query}`, { scroll: false });
  }, [searchParams, router]);

  // Cargar imágenes
  const fetchImages = useCallback(async (pageNum: number, search = '', from = '', to = '') => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (from && to) {
        params.append('dateFrom', from);
        params.append('dateTo', to);
      } else if (from) {
        params.append('dateFrom', from);
      }

      const response = await fetch(`/api/user-images?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar imágenes');

      const data = await response.json();

      if (pageNum === 0) {
        setImages(data.images);
      } else {
        setImages(prev => [...prev, ...data.images]);
      }

      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Establecer nuevo timer
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Restaurar filtros desde URL al cargar (solo primera vez)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlDateFrom = searchParams.get('dateFrom') || '';
    const urlDateTo = searchParams.get('dateTo') || '';

    // Restaurar estados si hay filtros en la URL
    if (urlSearch || urlDateFrom || urlDateTo) {
      setSearchInput(urlSearch);
      setSearchTerm(urlSearch);
      setDateFromInput(urlDateFrom);
      setDateToInput(urlDateTo);
      setDateFrom(urlDateFrom);
      setDateTo(urlDateTo);
    }
  }, []); // Solo al montar el componente

  // Cargar primera página con filtros
  useEffect(() => {
    const loadInitialImages = async () => {
      setInitialLoadComplete(false);
      scrollRestored.current = false; // Resetear flag cuando cambian filtros

      // Verificar si hay un número de imágenes guardado (para restaurar scroll)
      const savedImageCount = sessionStorage.getItem('gallery-image-count');
      const savedScroll = sessionStorage.getItem('gallery-scroll');

      if (savedImageCount && savedScroll) {
        // Cargar todas las imágenes que había antes de navegar al detalle
        const count = parseInt(savedImageCount);
        const pagesToLoad = Math.ceil(count / 20);

        try {
          setLoading(true);
          const params = new URLSearchParams({
            page: '0',
            limit: count.toString(),
          });

          if (searchTerm) params.append('search', searchTerm);
          if (dateFrom && dateTo) {
            params.append('dateFrom', dateFrom);
            params.append('dateTo', dateTo);
          } else if (dateFrom) {
            params.append('dateFrom', dateFrom);
          }

          const response = await fetch(`/api/user-images?${params.toString()}`);
          if (!response.ok) throw new Error('Error al cargar imágenes');

          const data = await response.json();
          setImages(data.images || []);
          setHasMore(data.hasMore);
          setTotal(data.total);
          setPage(pagesToLoad - 1);
          setInitialLoadComplete(true);
        } catch (error) {
          console.error('Error al cargar imágenes:', error);
          // Si falla, cargar normalmente
          await fetchImages(0, searchTerm, dateFrom, dateTo);
        } finally {
          setLoading(false);
        }
      } else {
        // Carga normal de la primera página
        await fetchImages(0, searchTerm, dateFrom, dateTo);
        setInitialLoadComplete(true);
      }
    };

    loadInitialImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateFrom, dateTo]);

  // Restaurar scroll al volver del detalle
  useEffect(() => {
    if (!scrollRestored.current && images.length > 0 && !loading && initialLoadComplete) {
      const savedScroll = sessionStorage.getItem('gallery-scroll');
      if (savedScroll) {
        // Usar requestAnimationFrame para asegurar que el DOM esté completamente renderizado
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: parseInt(savedScroll),
              behavior: 'instant' as ScrollBehavior
            });
            sessionStorage.removeItem('gallery-scroll');
            sessionStorage.removeItem('gallery-image-count');
            scrollRestored.current = true;
          });
        });
      }
    }
  }, [images, loading, initialLoadComplete]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchImages(page + 1, searchTerm, dateFrom, dateTo);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, page, searchTerm, dateFrom, dateTo]);

  // Handlers de filtros
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    // La URL se actualizará cuando searchTerm cambie (después del debounce)
  };

  const handleDateFromInput = (value: string) => {
    setDateFromInput(value);
  };

  const handleDateToInput = (value: string) => {
    setDateToInput(value);
  };

  const applyDateFilters = () => {
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
    updateURL({ search: searchInput, dateFrom: dateFromInput, dateTo: dateToInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setDateFromInput('');
    setDateToInput('');
    setDateFrom('');
    setDateTo('');
    updateURL({});
  };

  // Actualizar URL cuando searchTerm cambie (después del debounce)
  useEffect(() => {
    updateURL({ search: searchTerm, dateFrom, dateTo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateFrom, dateTo]);

  const handleImageClick = (imageId: number) => {
    // Guardar posición del scroll, filtros actuales y número de imágenes cargadas
    sessionStorage.setItem('gallery-scroll', window.scrollY.toString());
    sessionStorage.setItem('gallery-image-count', images.length.toString());

    // Construir URL con parámetros de retorno para mantener filtros
    const returnParams = new URLSearchParams();
    if (searchTerm) returnParams.set('search', searchTerm);
    if (dateFrom) returnParams.set('dateFrom', dateFrom);
    if (dateTo) returnParams.set('dateTo', dateTo);

    const returnQuery = returnParams.toString();
    const returnUrl = returnQuery ? `/dashboard/gallery?${returnQuery}` : '/dashboard/gallery';

    // Guardar URL de retorno
    sessionStorage.setItem('gallery-return-url', returnUrl);

    router.push(`/dashboard/gallery/${imageId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9]" />
      </div>
    );
  }

  const hasActiveFilters = searchInput || dateFrom || dateTo;
  const hasUnappliedDateFilters = dateFromInput !== dateFrom || dateToInput !== dateTo;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          🖼️ <span className="text-[#8C1AD9]">Your</span> Gallery
        </h1>
        <p className="text-gray-300">
          {total} image{total !== 1 ? 's' : ''} {hasActiveFilters && 'found'}
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or prompt..."
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8C1AD9] transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => handleSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Botón de limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filtros de fecha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="date"
              value={dateFromInput}
              onChange={(e) => handleDateFromInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasUnappliedDateFilters) {
                  applyDateFilters();
                }
              }}
              placeholder="From date"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8C1AD9] transition-colors"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
            <input
              type="date"
              value={dateToInput}
              onChange={(e) => handleDateToInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasUnappliedDateFilters) {
                  applyDateFilters();
                }
              }}
              placeholder="To date"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8C1AD9] transition-colors"
            />
          </div>
          <button
            onClick={applyDateFilters}
            disabled={!hasUnappliedDateFilters}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              hasUnappliedDateFilters
                ? 'bg-[#8C1AD9] hover:bg-[#7B16C2] text-white'
                : 'bg-zinc-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {dateFromInput || dateToInput ? 'Apply Date Filters' : 'Clear Date Filters'}
          </button>
        </div>

        {/* Indicador de filtros pendientes */}
        {hasUnappliedDateFilters && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateFromInput || dateToInput
                ? 'You have unapplied date filters. Click "Apply Date Filters" to search.'
                : 'Date filters cleared. Click "Clear Date Filters" to apply changes.'}
            </p>
          </div>
        )}

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
            <span>Active filters:</span>
            {searchInput && (
              <span className="px-2 py-1 bg-[#8C1AD9]/20 text-[#8C1AD9] rounded">
                Search: "{searchInput}"
              </span>
            )}
            {dateFrom && (
              <span className="px-2 py-1 bg-[#8C1AD9]/20 text-[#8C1AD9] rounded">
                From: {dateFrom}
              </span>
            )}
            {dateTo && (
              <span className="px-2 py-1 bg-[#8C1AD9]/20 text-[#8C1AD9] rounded">
                To: {dateTo}
              </span>
            )}
            {searchInput && searchTerm !== searchInput && (
              <span className="text-xs text-gray-500 italic">
                (searching...)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid de imágenes */}
      {images.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ImageIcon className="h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {hasActiveFilters ? 'No images found' : 'No images yet'}
          </h3>
          <p className="text-gray-400 mb-4">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Start creating images to see them here'}
          </p>
          {!hasActiveFilters && (
            <Link
              href="/dashboard/createImage"
              className="px-6 py-3 bg-gradient-to-r from-[#8C1AD9] to-[#2C2A59] text-white font-semibold rounded-lg hover:from-[#7B16C2] hover:to-[#1C228C] transition-all"
            >
              Create Your First Image
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageClick(image.id)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#8C1AD9]/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.original_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {image.prompt}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      {new Date(image.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observer target para scroll infinito */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-[#8C1AD9]" />
            )}
            {!hasMore && images.length > 0 && (
              <p className="text-gray-500 text-sm">No more images to load</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C1AD9]" />
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
