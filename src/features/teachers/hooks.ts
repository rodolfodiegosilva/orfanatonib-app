import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiAssignTeacherToShelter,
  apiGetTeacher,
  apiListSheltersSimple,
  apiListTeachers,
  apiUnassignTeacherFromShelter,
} from "./api";
import { ShelterSimple, TeacherProfile, TeacherQuery, Page } from "./types";
import type { SortingState } from "@tanstack/react-table";

export function useTeacherProfiles(
  pageIndex: number,  
  pageSize: number,
  sorting: SortingState,
  filters: Pick<TeacherQuery, "searchString" | "q" | "active" | "hasShelter" | "shelterName">,
) {
  const [rows, setRows] = useState<TeacherProfile[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q ?? undefined,
        searchString: filters.searchString ?? undefined,
        active: filters.active ?? undefined,
        hasShelter: filters.hasShelter ?? undefined,
        shelterName: filters.shelterName ?? undefined,
      }),
    [filters.q, filters.searchString, filters.active, filters.hasShelter, filters.shelterName]
  );

  const sortParam = useMemo<Pick<TeacherQuery, "sort" | "order">>(() => {
    const first = sorting?.[0];
    const map = {
      teacher: "name",
      updatedAt: "updatedAt",
      createdAt: "createdAt",
      shelter: "shelterNumber",
      coord: "name",
    } as const;
    if (!first) return { sort: "updatedAt", order: "desc" };
    type SortKey = (typeof map)[keyof typeof map];
    const id = first.id as keyof typeof map | "name" | "updatedAt" | "createdAt" | "shelterNumber";
    const sort: SortKey = map[id as keyof typeof map] ?? "updatedAt";
    const order: "asc" | "desc" = first.desc ? "desc" : "asc";
    return { sort, order };
  }, [sorting]);

  const seqRef = useRef(0);

  const fetchPage = useCallback(async () => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    setError("");
    try {
      const data: Page<TeacherProfile> = await apiListTeachers({
        ...(JSON.parse(filtersKey) as Pick<TeacherQuery, "searchString" | "q" | "active" | "hasShelter" | "shelterName">),
        page: pageIndex + 1, 
        limit: pageSize,
        sort: sortParam.sort,
        order: sortParam.order,
      });

      if (mySeq !== seqRef.current) return;

      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      if (mySeq !== seqRef.current) return;
      setError(err?.response?.data?.message || err.message || "Erro ao listar professores");
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  }, [filtersKey, pageIndex, pageSize, sortParam]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const refreshOne = useCallback(async (teacherId: string) => {
    try {
      const prof = await apiGetTeacher(teacherId);
      setRows(prev => {
        const i = prev.findIndex(p => p.id === teacherId);
        if (i === -1) return prev;
        const next = [...prev]; next[i] = prof; return next;
      });
    } catch {
      setRows(prev => prev.filter(p => p.id !== teacherId));
    }
  }, []);

  return { rows, total, loading, error, setError, fetchPage, refreshOne };
}

export function useTeacherMutations(
  refreshPage: () => Promise<void> | void,
  refreshOne: (teacherId: string) => Promise<void> | void
) {
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const setShelter = useCallback(async (teacherId: string, shelterId: string) => {
    setDialogLoading(true); setDialogError("");
    try { await apiAssignTeacherToShelter(teacherId, shelterId); await refreshOne(teacherId); }
    catch (err: any) { setDialogError(err?.response?.data?.message || err.message || "Erro ao vincular Abrigo"); throw err; }
    finally { setDialogLoading(false); }
  }, [refreshOne]);

  const clearShelter = useCallback(async (teacherId: string) => {
    setDialogLoading(true); setDialogError("");
    try {
      await apiUnassignTeacherFromShelter(teacherId);
      await refreshOne(teacherId);
    } catch (err: any) {
      setDialogError(err?.response?.data?.message || err.message || "Erro ao desvincular Abrigo");
      throw err;
    } finally { setDialogLoading(false); }
  }, [refreshOne]);

  return { dialogLoading, dialogError, setDialogError, setShelter, clearShelter };
}

export function useSheltersIndex() {
  const [shelters, setShelters] = useState<ShelterSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const list = await apiListSheltersSimple();
      setShelters(list || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Erro ao listar shelters");
    } finally {
      setLoading(false);
    }
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, ShelterSimple>();
    for (const c of shelters) map.set(c.id, c);
    return map;
  }, [shelters]);

  return { shelters, byId, loading, error, refresh };
}
