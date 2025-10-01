import api from "@/config/axiosConfig";
import {
  ShelterResponseDto, CreateShelterForm, EditShelterForm,
  LeaderMiniDto, TeacherOption, UserPublicDto,
  ShelterFilters, ShelterSort,
  LeaderOption, ShelterSimpleResponseDto, ShelterListResponseDto,
  AssignLeaderRequest, UnassignLeaderRequest, AssignTeacherRequest, UnassignTeacherRequest
} from "./types";
import { LeaderProfile } from "../leaders/types";
import { TeacherProfile } from "../teachers/types";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

// Endpoint 1: Listar Shelters (Paginação) - GET /shelters
export async function apiFetchShelters(args: {
  page: number;
  limit: number;
  filters?: ShelterFilters;
  sort?: ShelterSort;
}) {
  const { page, limit, filters, sort } = args;
  const {
    // Filtros principais
    shelterName,
    staffFilters,
    addressFilter,
    
    // Filtros legados para compatibilidade
    addressSearchString,
    userSearchString,
    shelterSearchString,
    searchString,
    city,
    state,
    leaderId,
    teacherId,
    hasLeaders,
    hasTeachers,
    leaderIds,
    teacherIds,
  } = filters || {};

  const sortField = sort?.id ?? "updatedAt";
  const order = sort?.desc ? "DESC" : "ASC";

  // Construir parâmetros com filtros simplificados
  const params: any = {
    page,
    limit,
    sort: sortField,
    order,
  };

  // Adicionar filtros principais
  if (shelterName) {
    params.shelterName = shelterName;
  }
  
  if (staffFilters) {
    params.staffFilters = staffFilters;
  }
  
  if (addressFilter) {
    params.addressFilter = addressFilter;
  }

  // Adicionar filtros legados para compatibilidade (mapeamento para novos filtros)
  if (shelterSearchString && !shelterName) {
    params.shelterName = shelterSearchString;
  }
  
  if (userSearchString && !staffFilters) {
    params.staffFilters = userSearchString;
  }
  
  if ((city || addressSearchString) && !addressFilter) {
    params.addressFilter = city || addressSearchString;
  }
  
  if (searchString && !shelterName && !staffFilters && !addressFilter) {
    // Se não há filtros específicos, usar searchString como shelterName
    params.shelterName = searchString;
  }

  const { data } = await api.get<PaginatedResponse<ShelterResponseDto>>("/shelters", {
    params,
  });
  return data;
}

// Endpoint 2: Listar Shelters Simples - GET /shelters/simple
export async function apiFetchSheltersSimple() {
  const { data } = await api.get<ShelterSimpleResponseDto[]>("/shelters/simple");
  return data;
}

// Endpoint 3: Listar Shelters para Select - GET /shelters/list
export async function apiFetchSheltersList() {
  const { data } = await api.get<ShelterListResponseDto[]>("/shelters/list");
  return data;
}

// Endpoint 4: Buscar Shelter por ID - GET /shelters/:id
export async function apiFetchShelter(id: string) {
  const { data } = await api.get<ShelterResponseDto>(`/shelters/${id}`);
  return data;
}

// Endpoint 5: Criar Shelter - POST /shelters
export async function apiCreateShelter(payload: CreateShelterForm) {
  const { data } = await api.post<ShelterResponseDto>("/shelters", payload);
  return data;
}

// Endpoint 6: Atualizar Shelter - PUT /shelters/:id
export async function apiUpdateShelter(id: string, payload: Omit<EditShelterForm, "id">) {
  const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, payload);
  return data;
}

// Endpoint 7: Deletar Shelter - DELETE /shelters/:id
export async function apiDeleteShelter(id: string) {
  await api.delete(`/shelters/${id}`);
}

// Novos endpoints para atribuição/remoção de leaders e teachers
// Atribuir Leader a Shelter - PATCH /leader-profiles/:leaderId/assign-shelter
export async function apiAssignLeaderToShelter(leaderId: string, payload: AssignLeaderRequest) {
  const { data } = await api.patch(`/leader-profiles/${leaderId}/assign-shelter`, payload);
  return data;
}

// Desatribuir Leader de Shelter - PATCH /leader-profiles/:leaderId/unassign-shelter
export async function apiUnassignLeaderFromShelter(leaderId: string, payload: UnassignLeaderRequest) {
  const { data } = await api.patch(`/leader-profiles/${leaderId}/unassign-shelter`, payload);
  return data;
}

// Atribuir Teacher a Shelter - PATCH /teacher-profiles/:teacherId/assign-shelter
export async function apiAssignTeacherToShelter(teacherId: string, payload: AssignTeacherRequest) {
  const { data } = await api.patch(`/teacher-profiles/${teacherId}/assign-shelter`, payload);
  return data;
}

// Desatribuir Teacher de Shelter - PATCH /teacher-profiles/:teacherId/unassign-shelter
export async function apiUnassignTeacherFromShelter(teacherId: string, payload: UnassignTeacherRequest) {
  const { data } = await api.patch(`/teacher-profiles/${teacherId}/unassign-shelter`, payload);
  return data;
}

// Endpoints auxiliares para carregar opções
export async function apiListUsersByRole(role: "leader" | "teacher", limit = 500) {
  const { data } = await api.get<{ items: { id: string; name?: string; email?: string }[] }>("/users", {
    params: { role, page: 1, limit, sort: "name", order: "ASC" },
  });
  return (Array.isArray(data?.items) ? data.items : []);
}

export async function apiGetLeaderProfile(userId: string) {
  const { data } = await api.get<LeaderMiniDto>(`/leader-profiles/${userId}`);
  return data;
}

export async function apiGetTeacherProfile(userId: string) {
  const { data } = await api.get<{ id: string; user: UserPublicDto; shelter?: { id: string; name?: string } | null }>(`/teacher-profiles/${userId}`);
  return data;
}

export async function apiLoadLeaderOptions() {
  const { data } = await api.get<LeaderProfile[]>("/leader-profiles");
  return data.map((c) => ({
    leaderProfileId: c.id,
    name: c.user?.name,
  })) as LeaderOption[];
}

export async function apiLoadTeacherOptions() {
  const { data } = await api.get<TeacherProfile[]>("/teacher-profiles");
  return data.map((t) => ({
    teacherProfileId: t.id,
    name: t.user?.name ?? t.user?.email ?? t.id,
    // Temporarily use id until types are fully updated
    assignedShelter: t.shelter?.name ?? t.shelter?.id ?? null,
    vinculado: !!t.shelter,
  })) as TeacherOption[];
}

export type TeacherSimpleApi = {
  teacherProfileId: string;
  name: string;
  vinculado: boolean;
};

export type LeaderSimpleApi = {
  leaderProfileId: string;
  name: string;
  vinculado: boolean;
};

export async function apiListTeachersSimple(): Promise<TeacherSimpleApi[]> {
  const { data } = await api.get<TeacherSimpleApi[]>("/teacher-profiles/simple");
  return data;
}

export async function apiListLeadersSimple(): Promise<LeaderSimpleApi[]> {
  const { data } = await api.get<LeaderSimpleApi[]>("/leader-profiles/simple");
  return data;
}
