import { useCallback, useEffect, useState } from "react";
import {
  apiCreateShelter,
  apiDeleteShelter,
  apiFetchShelter,
  apiFetchShelters,
  apiListLeadersSimple,
  apiListTeachersSimple,
  apiUpdateShelter,
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

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchShelters({
        page: pageIndex + 1,
        limit: pageSize,
        filters,
        sort: sorting,
      });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar shelteres");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, filters, sorting]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return { rows, total, loading, error, setRows, setTotal, fetchPage, setError };
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
  fetchShelters: (page: number, limit: number, filters?: ShelterFilters, sort?: ShelterSort) => Promise<void> | void
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const createShelter = useCallback(
    async (payload: CreateShelterForm, page: number, limit: number, filters?: ShelterFilters, sort?: ShelterSort) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiCreateShelter(payload);
        await fetchShelters(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao criar shelterinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchShelters]
  );

  const updateShelter = useCallback(
    async (
      id: string,
      payload: Omit<EditShelterForm, "id">,
      page: number,
      limit: number,
      filters?: ShelterFilters,
      sort?: ShelterSort
    ) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiUpdateShelter(id, payload);
        await fetchShelters(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao atualizar shelterinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchShelters]
  );

  const deleteShelter = useCallback(
    async (id: string, page: number, limit: number, filters?: ShelterFilters, sort?: ShelterSort) => {
      setDialogLoading(true);
      setDialogError("");
      try {
        await apiDeleteShelter(id);
        await fetchShelters(page, limit, filters, sort);
      } catch (err: any) {
        setDialogError(err?.response?.data?.message || err.message || "Erro ao remover shelterinho");
      } finally {
        setDialogLoading(false);
      }
    },
    [fetchShelters]
  );

  return { dialogLoading, dialogError, setDialogError, createShelter, updateShelter, deleteShelter };
}

export function useOptions() {
  const [leaders, setLeaders] = useState<LeaderOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  const loadRefs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  return { leaders, teachers, reloadOptions: loadRefs };
}
