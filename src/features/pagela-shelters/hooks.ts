import { useState, useEffect, useCallback } from 'react';
import { PagelaSheltersApi } from './api';
import type {
  SheltersResponse,
  ShelteredResponse,
  PagelasResponse,
  SheltersFilters,
  ShelteredFilters,
  PagelasFilters,
  ShelterDto,
  ShelteredDto,
  PagelaDto,
} from './types';

export const useShelters = (filters: SheltersFilters = {}) => {
  const [data, setData] = useState<SheltersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchShelters = useCallback(async (newFilters?: SheltersFilters, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getShelters({
        ...newFilters,
        page,
        limit: 5,
      });
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar shelters');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  const handlePageChange = (page: number) => {
    fetchShelters(filters, page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages: data?.pageCount || 0,
    refetch: fetchShelters,
    handlePageChange,
  };
};

export const useSheltered = (filters: ShelteredFilters | undefined = undefined, enabled: boolean = true) => {
  const [data, setData] = useState<ShelteredResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSheltered = useCallback(async (newFilters?: ShelteredFilters, page: number = 1) => {
    if (!enabled || !filters) return;
    
    const filtersKey = JSON.stringify({ ...filters, page });
    if (filtersKey === lastFilters) return;
    
    setLastFilters(filtersKey);
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getSheltered({
        ...(newFilters || filters),
        page,
        limit: 5,
      });
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sheltered');
    } finally {
      setLoading(false);
    }
  }, [filters, enabled, lastFilters]);

  useEffect(() => {
    if (enabled && filters) {
      fetchSheltered();
    } else {
      setData(null);
      setError(null);
      setLoading(false);
      setLastFilters('');
      setCurrentPage(1);
    }
  }, [enabled, filters]);

  const handlePageChange = (page: number) => {
    fetchSheltered(filters, page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages: data?.meta?.totalPages || 0,
    refetch: fetchSheltered,
    handlePageChange,
  };
};

export const usePagelas = (filters: PagelasFilters | undefined = undefined, enabled: boolean = true) => {
  const [data, setData] = useState<PagelasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPagelas = useCallback(async (newFilters?: PagelasFilters, page: number = 1) => {
    if (!enabled || !filters) return;
    
    const filtersKey = JSON.stringify({ ...filters, page });
    if (filtersKey === lastFilters) return;
    
    setLastFilters(filtersKey);
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getPagelas({
        ...(newFilters || filters),
        page,
        limit: 5,
      });
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagelas');
    } finally {
      setLoading(false);
    }
  }, [filters, enabled, lastFilters]);

  useEffect(() => {
    if (enabled && filters) {
      fetchPagelas();
    } else {
      setData(null);
      setError(null);
      setLoading(false);
      setLastFilters('');
      setCurrentPage(1);
    }
  }, [enabled, filters]);

  const handlePageChange = (page: number) => {
    fetchPagelas(filters, page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages: Math.ceil((data?.total || 0) / 5),
    refetch: fetchPagelas,
    handlePageChange,
  };
};

// Hook principal que gerencia o estado global do componente
export const usePagelaSheltersManager = () => {
  const [selectedShelter, setSelectedShelter] = useState<ShelterDto | null>(null);
  const [selectedSheltered, setSelectedSheltered] = useState<ShelteredDto | null>(null);
  const [sheltersFilters, setSheltersFilters] = useState<SheltersFilters>({});
  const [shelteredFilters, setShelteredFilters] = useState<ShelteredFilters>({});
  const [pagelasFilters, setPagelasFilters] = useState<PagelasFilters>({});

  // Shelters
  const shelters = useShelters(sheltersFilters);

  // Sheltered - só carrega quando há shelter selecionado
  const sheltered = useSheltered(
    selectedShelter 
      ? { ...shelteredFilters, shelterId: selectedShelter.id }
      : undefined,
    !!selectedShelter
  );

  // Pagelas - só carrega quando há sheltered selecionado
  const pagelas = usePagelas(
    selectedSheltered
      ? { 
          ...pagelasFilters, 
          shelteredId: selectedSheltered.id,
          year: 2025, // Ano padrão
          visit: 6, // Visita padrão
          present: true // Presente padrão
        }
      : undefined,
    !!selectedSheltered
  );

  const handleShelterSelect = (shelter: ShelterDto) => {
    setSelectedShelter(shelter);
    setSelectedSheltered(null); // Reset sheltered selection
    setShelteredFilters({}); // Reset sheltered filters
  };

  const handleShelteredSelect = (sheltered: ShelteredDto) => {
    setSelectedSheltered(sheltered);
    setPagelasFilters({}); // Reset pagelas filters
  };

  const handleBack = () => {
    if (selectedSheltered) {
      setSelectedSheltered(null);
    } else if (selectedShelter) {
      setSelectedShelter(null);
    }
  };

  return {
    // Estado
    selectedShelter,
    selectedSheltered,
    
    // Dados das APIs
    shelters,
    sheltered,
    pagelas,
    
    // Filtros
    sheltersFilters,
    shelteredFilters,
    pagelasFilters,
    
    // Ações
    handleShelterSelect,
    handleShelteredSelect,
    handleBack,
    setSheltersFilters,
    setShelteredFilters,
    setPagelasFilters,
  };
};
