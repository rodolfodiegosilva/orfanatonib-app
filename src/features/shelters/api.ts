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
    searchString,
    nameSearchString,
    leaderId,
  } = filters || {};

  const sortField = sort?.id ?? "updatedAt";
  const order = sort?.desc ? "DESC" : "ASC";

  // Construir parâmetros conforme nova API
  const params: any = {
    page,
    limit,
    sort: sortField,
    order,
  };

  // Adicionar filtros
  if (searchString) {
    params.searchString = searchString;
  }
  
  if (nameSearchString) {
    params.nameSearchString = nameSearchString;
  }
  
  if (leaderId) {
    params.leaderId = leaderId;
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
export async function apiCreateShelter(payload: CreateShelterForm | FormData) {
  // Se já é FormData, enviar direto
  if (payload instanceof FormData) {
    const { data } = await api.post<ShelterResponseDto>("/shelters", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }
  
  // Se há arquivo, usar FormData
  if (payload.file) {
    const formData = new FormData();
    
    // Preparar dados do shelter sem o arquivo
    const shelterData = {
      name: payload.name,
      description: payload.description,
      address: payload.address,
      leaderProfileIds: payload.leaderProfileIds,
      teacherProfileIds: payload.teacherProfileIds,
      mediaItem: payload.mediaItem,
    };
    
    // Adicionar JSON como string
    formData.append("shelterData", JSON.stringify(shelterData));
    
    // Adicionar arquivo com o nome do fieldKey
    const fieldKey = payload.mediaItem?.fieldKey || "shelterImage";
    formData.append(fieldKey, payload.file);
    
    const { data } = await api.post<ShelterResponseDto>("/shelters", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } else {
    // Sem arquivo, usar JSON simples
    const { file, ...rest } = payload;
    const { data } = await api.post<ShelterResponseDto>("/shelters", rest);
    return data;
  }
}

// Endpoint 6: Atualizar Shelter - PUT /shelters/:id
export async function apiUpdateShelter(id: string, payload: Omit<EditShelterForm, "id"> | FormData) {
  // Se já é FormData, enviar direto
  if (payload instanceof FormData) {
    const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  }
  
  // Se há arquivo, usar FormData
  if (payload.file) {
    const formData = new FormData();
    
    // Preparar dados do shelter sem o arquivo
    const shelterData = {
      name: payload.name,
      description: payload.description,
      address: payload.address,
      leaderProfileIds: payload.leaderProfileIds,
      teacherProfileIds: payload.teacherProfileIds,
      mediaItem: payload.mediaItem,
    };
    
    // Adicionar JSON como string
    formData.append("shelterData", JSON.stringify(shelterData));
    
    // Adicionar arquivo com o nome do fieldKey
    const fieldKey = payload.mediaItem?.fieldKey || "shelterImage";
    formData.append(fieldKey, payload.file);
    
    const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } else {
    // Sem arquivo, usar JSON simples
    const { file, ...rest } = payload;
    const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, rest);
    return data;
  }
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
  // Buscar TODOS os professores fazendo múltiplas requisições
  let allTeachers: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const { data } = await api.get(`/teacher-profiles?page=${page}&limit=50`);
    
    if (data?.items && data.items.length > 0) {
      allTeachers.push(...data.items);
      hasMore = data.items.length === 50; // Se retornou 50, pode ter mais
      page++;
    } else {
      hasMore = false;
    }
  }
  
  const mapped = allTeachers.map((t: any) => ({
    teacherProfileId: t.id,
    name: t.user?.name || t.user?.email || t.id,
    vinculado: !!t.shelter,
  }));
  
  return mapped;
}

export async function apiListLeadersSimple(): Promise<LeaderSimpleApi[]> {
  // Buscar apenas líderes disponíveis (não vinculados) da API padrão
  let allLeaders: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const { data } = await api.get(`/leader-profiles?page=${page}&limit=50`);
    
    if (data?.items && data.items.length > 0) {
      allLeaders.push(...data.items);
      hasMore = data.items.length === 50;
      page++;
    } else {
      hasMore = false;
    }
  }
  
  const mapped = allLeaders.map((l: any) => ({
    leaderProfileId: l.id,
    name: l.user?.name || l.user?.email || l.id,
    vinculado: !!l.shelter,
  }));
  
  return mapped;
}
