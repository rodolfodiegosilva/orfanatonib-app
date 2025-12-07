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

  const params: Record<string, any> = {
      page,
      limit,
      orderBy,
      order,
  };

  // Filtros agrupados (novos)
  if (filters?.shelteredSearchingString?.trim()) params.shelteredSearchingString = filters.shelteredSearchingString;
  if (filters?.shelterSearchingString?.trim()) params.shelterSearchingString = filters.shelterSearchingString;
  if (filters?.addressFilter?.trim()) params.addressFilter = filters.addressFilter;
  if (filters?.gender) params.gender = filters.gender;
  if (filters?.birthDateFrom) params.birthDateFrom = filters.birthDateFrom;
  if (filters?.birthDateTo) params.birthDateTo = filters.birthDateTo;
  if (filters?.joinedFrom) params.joinedFrom = filters.joinedFrom;
  if (filters?.joinedTo) params.joinedTo = filters.joinedTo;

  // Filtros legados (compatibilidade)
  if (filters?.searchString?.trim()) params.searchString = filters.searchString;
  if (filters?.shelterId) params.shelterId = filters.shelterId;
  if (filters?.shelterName?.trim()) params.shelterName = filters.shelterName;
  if (filters?.city?.trim()) params.city = filters.city;
  if (filters?.state?.trim()) params.state = filters.state;
  if (filters?.birthDate) params.birthDate = filters.birthDate;
  if (filters?.joinedAt) params.joinedAt = filters.joinedAt;

  const { data } = await api.get<Paginated<ShelteredResponseDto>>("/sheltered", { params });
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
