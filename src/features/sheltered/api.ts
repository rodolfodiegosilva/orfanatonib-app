import api from "@/config/axiosConfig";
import { ShelteredResponseDto, Paginated, CreateShelteredForm, EditShelteredForm, ShelteredFilters, ShelteredSort, ShelteredSimpleResponseDto } from "./types";

export async function apiFetchShelteredren(args: {
  page: number;
  limit: number;
  filters?: ShelteredFilters;
  sort?: ShelteredSort;
}) {
  const { page, limit, filters, sort } = args;
  const orderBy = sort?.id ?? 'name';
  const order = sort?.desc ? 'DESC' : 'ASC';

  const { data } = await api.get<Paginated<ShelteredResponseDto>>("/sheltered", {
    params: {
      page,
      limit,
      orderBy,
      order,
      searchString: filters?.searchString || undefined,
      shelterId: filters?.shelterId || undefined,
      shelterName: filters?.shelterName || undefined,
      city: filters?.city || undefined,
      state: filters?.state || undefined,
      gender: filters?.gender || undefined,
      birthDate: filters?.birthDate || undefined,
      birthDateFrom: filters?.birthDateFrom || undefined,
      birthDateTo: filters?.birthDateTo || undefined,
      joinedAt: filters?.joinedAt || undefined,
      joinedFrom: filters?.joinedFrom || undefined,
      joinedTo: filters?.joinedTo || undefined,
    },
  });
  return data;
}

export async function apiFetchSheltered(id: string) {
  const { data } = await api.get<ShelteredResponseDto>(`/sheltered/${id}`);
  return data;
}

export async function apiFetchShelteredSimple() {
  const { data } = await api.get<ShelteredSimpleResponseDto[]>(`/sheltered/simple`);
  return data;
}

export async function apiCreateSheltered(payload: CreateShelteredForm) {
  const { data } = await api.post<ShelteredResponseDto>("/sheltered", payload);
  return data;
}

export async function apiUpdateSheltered(id: string, payload: Omit<EditShelteredForm, "id">) {
  const { data } = await api.put<ShelteredResponseDto>(`/sheltered/${id}`, payload);
  return data;
}

export async function apiDeleteSheltered(id: string) {
  await api.delete(`/sheltered/${id}`);
}
