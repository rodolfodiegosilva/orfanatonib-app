import { useCallback, useEffect, useState, useRef } from "react";
import {
  apiCreateShelter,
  apiDeleteShelter,
  apiFetchShelter,
  apiFetchShelters,
  apiListLeadersSimple,
  apiListTeachersSimple,
  apiUpdateShelter,
  apiAssignLeaderToShelter,
  apiUnassignLeaderFromShelter,
  apiAssignTeacherToShelter,
  apiUnassignTeacherFromShelter,
} from "./api";
import {
  ShelterResponseDto,
  CreateShelterForm,
  EditShelterForm,
  TeacherOption,
  ShelterFilters,
  ShelterSort,
  LeaderOption,
} from "./types";

// Hook para debounce com limpeza de valores vazios
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Limpar valores vazios para evitar parâmetros desnecessários
      if (typeof value === 'object' && value !== null) {
        const cleanedValue = Object.fromEntries(
          Object.entries(value as any).map(([key, val]) => [
            key, 
            val === "" || val === null || val === undefined ? undefined : val
          ])
        ) as T;
        setDebouncedValue(cleanedValue);
      } else {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [JSON.stringify(value), delay]); // Usar JSON.stringify para detectar mudanças em objetos

  return debouncedValue;
}

export function useShelters(
  pageIndex: number,
  pageSize: number,
  sorting: ShelterSort,
  filters: ShelterFilters
) {
  const [rows, setRows] = useState<ShelterResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Debounce dos filtros para evitar requests excessivas
  const debouncedFilters = useDebounce(filters, 500);
  
  // Ref para evitar requests duplicadas
  const lastRequestRef = useRef<string>("");

  const fetchPage = useCallback(async (force = false) => {
    // Criar uma chave única para esta request
    const requestKey = `${pageIndex}-${pageSize}-${JSON.stringify(sorting)}-${JSON.stringify(debouncedFilters)}`;
    
    // Evitar requests duplicadas (exceto quando forçado)
    if (!force && lastRequestRef.current === requestKey) {
      return;
    }
    
    lastRequestRef.current = requestKey;
    
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchShelters({
        page: pageIndex + 1,
        limit: pageSize,
        filters: debouncedFilters,
        sort: sorting,
      });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar shelters");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, sorting, JSON.stringify(debouncedFilters)]); // Usar JSON.stringify para detectar mudanças

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { rows, total, loading, error, setRows, setTotal, fetchPage: () => fetchPage(true), setError };
}

export function useShelterDetails() {
  const [viewing, setViewing] = useState<ShelterResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShelter = useCallback(async (id: string) => {
    setLoading(true);
    try {
      setViewing(await apiFetchShelter(id));
    } finally {
      setLoading(false);
    }
  }, []);

  return { viewing, setViewing, loading, fetchShelter };
}

export function useShelterMutations(
  onSuccess?: () => Promise<void>
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const createShelter = useCallback(
    async (payload: CreateShelterForm) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiCreateShelter(payload);
        if (onSuccess) await onSuccess();
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao criar shelter");
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [onSuccess]
  );

  const updateShelter = useCallback(
    async (id: string, payload: Omit<EditShelterForm, "id">) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiUpdateShelter(id, payload);
        if (onSuccess) await onSuccess();
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao atualizar shelter");
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [onSuccess]
  );

  const deleteShelter = useCallback(
    async (id: string) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiDeleteShelter(id);
        if (onSuccess) await onSuccess();
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao remover shelter");
        throw err;
      } finally {
        setDialogLoading(false);
      }
    },
    [onSuccess]
  );

  return { dialogLoading, dialogError, setDialogError, createShelter, updateShelter, deleteShelter };
}

export function useOptions() {
  const [leaders, setLeaders] = useState<LeaderOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadRefs = useCallback(async () => {
    if (loaded) return; // Evita carregar se já foi carregado
    
    setLoading(true);
    try {
      const [coordsApi, teachersApi] = await Promise.all([
        apiListLeadersSimple(),
        apiListTeachersSimple(),
      ]);

      const mappedCoords: LeaderOption[] = (coordsApi ?? []).map((c) => ({
        leaderProfileId: c.leaderProfileId,
        name: c.name,
      }));

      const mappedTeachers: TeacherOption[] = (teachersApi ?? []).map((t) => ({
        teacherProfileId: t.teacherProfileId,
        name: t.name,
        vinculado: !!t.vinculado,
      }));

      setLeaders(mappedCoords);
      setTeachers(mappedTeachers);
      setLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  const reloadOptions = useCallback(async () => {
    setLoaded(false); // Força recarregar
    await loadRefs();
  }, [loadRefs]);

  return { leaders, teachers, loading, reloadOptions, loadRefs };
}

// Novo hook para operações de atribuição/remoção
export function useShelterAssignments(onSuccess?: () => Promise<void>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const assignLeader = useCallback(async (leaderId: string, shelterId: string) => {
    setLoading(true);
    setError("");
    try {
      await apiAssignLeaderToShelter(leaderId, { shelterId });
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao atribuir líder");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const unassignLeader = useCallback(async (leaderId: string, shelterId: string) => {
    setLoading(true);
    setError("");
    try {
      await apiUnassignLeaderFromShelter(leaderId, { shelterId });
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao desatribuir líder");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const assignTeacher = useCallback(async (teacherId: string, shelterId: string) => {
    setLoading(true);
    setError("");
    try {
      await apiAssignTeacherToShelter(teacherId, { shelterId });
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao atribuir professor");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const unassignTeacher = useCallback(async (teacherId: string, shelterId: string) => {
    setLoading(true);
    setError("");
    try {
      await apiUnassignTeacherFromShelter(teacherId, { shelterId });
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao desatribuir professor");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    loading,
    error,
    setError,
    assignLeader,
    unassignLeader,
    assignTeacher,
    unassignTeacher,
  };
}
