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
  const [lastFilters, setLastFilters] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchShelters = useCallback(async (newFilters?: SheltersFilters, page: number = 1) => {
    const currentFilters = newFilters || filters;
    
    const filtersKey = JSON.stringify({ ...currentFilters, page });
    if (filtersKey === lastFilters) return;
    
    setLastFilters(filtersKey);
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getShelters({
        ...currentFilters,
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
  }, [lastFilters]);

  useEffect(() => {
    fetchShelters(filters);
  }, [fetchShelters, filters]);

  const handlePageChange = (page: number) => {
    fetchShelters(filters, page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages: Math.ceil((data?.total || 0) / 10),
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
    const currentFilters = newFilters || filters;
    if (!enabled || !currentFilters) return;
    
    const filtersKey = JSON.stringify({ ...currentFilters, page });
    if (filtersKey === lastFilters) return;
    
    setLastFilters(filtersKey);
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getSheltered({
        ...currentFilters,
        page,
        limit: 20,
      });
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar sheltered');
    } finally {
      setLoading(false);
    }
  }, [enabled, lastFilters, filters]);

  useEffect(() => {
    if (enabled && filters) {
      fetchSheltered(filters);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
      setLastFilters('');
      setCurrentPage(1);
    }
  }, [enabled, filters, fetchSheltered]);

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
    const currentFilters = newFilters || filters;
    if (!enabled || !currentFilters) return;
    
    const filtersKey = JSON.stringify({ ...currentFilters, page });
    if (filtersKey === lastFilters) return;
    
    setLastFilters(filtersKey);
    setLoading(true);
    setError(null);
    
    try {
      const result = await PagelaSheltersApi.getPagelas({
        ...currentFilters,
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
  }, [enabled, lastFilters, filters]);

  useEffect(() => {
    if (enabled && filters) {
      fetchPagelas(filters);
    } else {
      setData(null);
      setError(null);
      setLoading(false);
      setLastFilters('');
      setCurrentPage(1);
    }
  }, [enabled, filters, fetchPagelas]);

  const handlePageChange = (page: number) => {
    fetchPagelas(filters, page);
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages: Math.ceil((data?.total || 0) / 20),
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
  const shelteredFiltersWithShelter = selectedShelter 
    ? { ...shelteredFilters, shelterId: selectedShelter.id }
    : undefined;
  
  
  const sheltered = useSheltered(shelteredFiltersWithShelter, !!selectedShelter);

  // Pagelas - só carrega quando há sheltered selecionado
  const pagelasFiltersWithSheltered = selectedSheltered
    ? { 
        ...pagelasFilters, 
        shelteredId: selectedSheltered.id,
        year: 2025, // Ano padrão
        visit: 6, // Visita padrão
        present: true // Presente padrão
      }
    : undefined;
  
  
  const pagelas = usePagelas(pagelasFiltersWithSheltered, !!selectedSheltered);

  const handleShelterSelect = (shelter: ShelterDto | null) => {
    setSelectedShelter(shelter);
    setSelectedSheltered(null); // Reset sheltered selection
    setShelteredFilters({}); // Reset sheltered filters
    setPagelasFilters({}); // Reset pagelas filters
  };

  const handleShelteredSelect = (sheltered: ShelteredDto | null) => {
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

  const handleSheltersSearchChange = (searchString: string) => {
    setSheltersFilters(prev => ({
      ...prev,
      nameSearchString: searchString,
      page: 1,
    }));
  };

  const handleShelteredSearchChange = (searchString: string) => {
    setShelteredFilters(prev => ({
      ...prev,
      shelteredName: searchString,
      page: 1,
    }));
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
    handleSheltersSearchChange,
    handleShelteredSearchChange,
  };
};
