import api from "@/config/axiosConfig";
import { ShelteredResponseDto, Paginated, CreateShelteredForm, EditShelteredForm, ShelteredFilters, ShelteredSort, ShelteredSimpleResponseDto } from "./types";

export async function apiFetchShelteredren(args: {
  page: number;
  limit: number;
  filters?: ShelteredFilters;
  sort?: ShelteredSort;
}) {
  const { page, limit, filters, sort } = args;
  const orderBy = sort?.id ?? 'updatedAt';
  const order = sort?.desc ? 'DESC' : 'ASC';

  const { data } = await api.get<Paginated<ShelteredResponseDto>>("/shelteredren", {
    params: {
      page,
      limit,
      orderBy,
      order,
      searchString: filters?.searchString || undefined,
      shelterNumber: filters?.shelterNumber ?? undefined,
      birthDateFrom: filters?.birthDateFrom || undefined,
      birthDateTo: filters?.birthDateTo || undefined,
      joinedFrom: filters?.joinedFrom || undefined,
      joinedTo: filters?.joinedTo || undefined,
    },
  });
  return data;
}

export async function apiFetchSheltered(id: string) {
  const { data } = await api.get<ShelteredResponseDto>(`/shelteredren/${id}`);
  return data;
}

export async function apiFetchShelteredSimple() {
  const { data } = await api.get<ShelteredSimpleResponseDto[]>(`/shelteredren/simple`);
  return data;
}

export async function apiCreateSheltered(payload: CreateShelteredForm) {
  const { data } = await api.post<ShelteredResponseDto>("/shelteredren", payload);
  return data;
}

export async function apiUpdateSheltered(id: string, payload: Omit<EditShelteredForm, "id">) {
  const { data } = await api.put<ShelteredResponseDto>(`/shelteredren/${id}`, payload);
  return data;
}

export async function apiDeleteSheltered(id: string) {
  await api.delete(`/shelteredren/${id}`);
}
