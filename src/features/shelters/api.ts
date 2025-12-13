import api from "@/config/axiosConfig";
import {
  ShelterResponseDto, CreateShelterForm, EditShelterForm,
  LeaderMiniDto, TeacherOption, UserPublicDto,
  ShelterFilters, ShelterSort,
  LeaderOption, ShelterSimpleResponseDto, ShelterListResponseDto
} from "./types";
import { LeaderProfile } from "../leaders/types";
import { TeacherProfile } from "../teachers/types";
import { apiListTeachersSimple } from "../teachers/api";

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
    // Filtros principais (conforme documentação)
    shelterName,
    staffFilters,
    addressFilter,
    teamId,
    teamName,
    leaderId,
    // Filtros legados (compatibilidade)
    searchString,
    nameSearchString,
  } = filters || {};

  const sortField = sort?.id ?? "name";
  const order = sort?.desc ? "DESC" : "ASC";

  // Construir parâmetros conforme nova API
  const params: any = {
    page,
    limit,
    sort: sortField,
    order,
  };

  // Adicionar filtros principais (prioridade)
  if (shelterName) {
    params.shelterName = shelterName;
  } else if (nameSearchString) {
    // Fallback para filtro legado
    params.shelterName = nameSearchString;
  }
  
  if (staffFilters) {
    params.staffFilters = staffFilters;
  }
  
  if (addressFilter) {
    params.addressFilter = addressFilter;
  }
  
  if (teamId) {
    params.teamId = teamId;
  }
  
  if (teamName) {
    params.teamName = teamName;
  }
  
  if (leaderId) {
    params.leaderId = leaderId;
  }
  
  // Filtros legados (compatibilidade)
  if (searchString && !shelterName && !nameSearchString) {
    params.searchString = searchString;
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
    // Verificar se teams está no FormData
    const shelterDataStr = payload.get('shelterData');
    if (shelterDataStr) {
      try {
        const shelterData = JSON.parse(shelterDataStr as string);
        console.log("🟢 [apiCreateShelter] FormData shelterData:", JSON.stringify(shelterData, null, 2));
      } catch (e) {
        console.warn("⚠️ [apiCreateShelter] Erro ao parsear shelterData do FormData:", e);
      }
    }
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
    const shelterData: any = {
      name: payload.name,
      description: payload.description,
      teamsQuantity: payload.teamsQuantity, // Campo obrigatório
      address: payload.address,
      mediaItem: payload.mediaItem ? {
        uploadType: "upload", // Conforme documentação: "upload" ou "link"
        isLocalFile: true, // Arquivo local
        fieldKey: "image", // Nome do campo no form-data
        title: payload.mediaItem.title || "Foto do Abrigo",
        description: payload.mediaItem.description || "Imagem do abrigo",
      } : undefined,
    };
    
    // ⭐ Incluir teams apenas se presente e não vazio (opcional conforme documentação)
    if ((payload as any).teams && Array.isArray((payload as any).teams) && (payload as any).teams.length > 0) {
      shelterData.teams = (payload as any).teams;
    }
    
    console.log("🟢 [apiCreateShelter] shelterData (com arquivo):", JSON.stringify(shelterData, null, 2));
    // Adicionar JSON como string
    formData.append("shelterData", JSON.stringify(shelterData));
    
    // Adicionar arquivo com o nome conforme documentação
    formData.append("image", payload.file);
    
    const { data } = await api.post<ShelterResponseDto>("/shelters", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } else {
    // Sem arquivo, usar JSON simples
    const { file, ...rest } = payload;
    
    // Ajustar mediaItem para formato de link se presente
    if (rest.mediaItem && rest.mediaItem.url) {
      rest.mediaItem = {
        uploadType: "link", // Conforme documentação: "upload" ou "link"
        isLocalFile: false, // URL externa
        url: rest.mediaItem.url,
        title: rest.mediaItem.title || "Foto do Abrigo",
        description: rest.mediaItem.description || "Imagem do abrigo",
      };
    } else if (rest.mediaItem && !rest.mediaItem.url) {
      // Se mediaItem existe mas não tem URL, remover (não é válido)
      delete rest.mediaItem;
    }
    
    // ⭐ Incluir teams apenas se presente e não vazio (opcional conforme documentação)
    if (rest.teams && Array.isArray(rest.teams) && rest.teams.length === 0) {
      delete rest.teams;
    }
    
    console.log("🟢 [apiCreateShelter] Payload JSON (sem arquivo):", JSON.stringify(rest, null, 2));
    const { data } = await api.post<ShelterResponseDto>("/shelters", rest);
    return data;
  }
}

// Endpoint 6: Atualizar Shelter - PUT /shelters/:id
export async function apiUpdateShelter(id: string, payload: Omit<EditShelterForm, "id"> | FormData) {
  // Se já é FormData, enviar direto
  if (payload instanceof FormData) {
    // Verificar se teams está no FormData
    const shelterDataStr = payload.get('shelterData');
    if (shelterDataStr) {
      try {
        const shelterData = JSON.parse(shelterDataStr as string);
        console.log("🟢 [apiUpdateShelter] FormData shelterData:", JSON.stringify(shelterData, null, 2));
      } catch (e) {
        console.warn("⚠️ [apiUpdateShelter] Erro ao parsear shelterData do FormData:", e);
      }
    }
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
    const shelterData: any = {
      name: payload.name,
      description: payload.description,
      teamsQuantity: payload.teamsQuantity, // Campo obrigatório
      address: payload.address,
      mediaItem: payload.mediaItem ? {
        title: payload.mediaItem.title || "Foto do Abrigo",
        description: payload.mediaItem.description || "Imagem do abrigo",
        uploadType: payload.mediaItem.uploadType === "upload" ? "UPLOAD" : "LINK",
        url: payload.mediaItem.url,
      } : undefined,
    };
    
    // ⭐ Incluir teams se presente (conforme documentação atualizada)
    if ((payload as any).teams) {
      shelterData.teams = (payload as any).teams;
    }
    
    console.log("🟢 [apiCreateShelter] shelterData (com arquivo):", JSON.stringify(shelterData, null, 2));
    // Adicionar JSON como string
    formData.append("shelterData", JSON.stringify(shelterData));
    
    // Adicionar arquivo com o nome conforme documentação
    formData.append("image", payload.file);
    
    const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } else {
    // Sem arquivo, usar JSON simples
    const { file, ...rest } = payload;
    const payloadJson: any = {
      name: rest.name,
      description: rest.description,
      teamsQuantity: rest.teamsQuantity, // Campo obrigatório
      address: rest.address,
    };
    
    // ⭐ Incluir teams se presente (conforme documentação atualizada)
    if ((rest as any).teams) {
      payloadJson.teams = (rest as any).teams;
    }
    
    // Incluir mediaItem apenas se for link
    if (rest.mediaItem && rest.mediaItem.uploadType === "link" && rest.mediaItem.url) {
      payloadJson.mediaItem = {
        title: rest.mediaItem.title || "Foto do Abrigo",
        description: rest.mediaItem.description || "Imagem do abrigo",
        uploadType: "LINK",
        url: rest.mediaItem.url,
      };
    }
    
    console.log("🟢 [apiUpdateShelter] Payload JSON (sem arquivo):", JSON.stringify(payloadJson, null, 2));
    const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, payloadJson);
    return data;
  }
}

// Endpoint 7: Atualizar Mídia do Shelter - PATCH /shelters/:id/media
export async function apiUpdateShelterMedia(
  id: string,
  payload: {
    mediaItem?: {
      title?: string;
      description?: string;
      uploadType: "upload" | "link";
      url?: string;
    };
    file?: File;
  }
) {
  // Se há arquivo, usar FormData
  if (payload.file) {
    const formData = new FormData();
    
    const mediaData = {
      title: payload.mediaItem?.title || "Foto do Abrigo",
      description: payload.mediaItem?.description || "Imagem do abrigo",
      uploadType: "UPLOAD",
    };
    
    formData.append("mediaData", JSON.stringify(mediaData));
    formData.append("image", payload.file); // Campo conforme documentação
    
    const { data } = await api.patch<ShelterResponseDto>(`/shelters/${id}/media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } else {
    // Sem arquivo, usar JSON simples
    const { data } = await api.patch<ShelterResponseDto>(`/shelters/${id}/media`, {
      title: payload.mediaItem?.title || "Foto do Abrigo",
      description: payload.mediaItem?.description || "Imagem do abrigo",
      uploadType: payload.mediaItem?.uploadType === "link" ? "LINK" : "UPLOAD",
      url: payload.mediaItem?.url,
    });
    return data;
  }
}

// Endpoint 5: Buscar Quantidade de Equipes do Abrigo - GET /shelters/:id/teams-quantity
export async function apiGetShelterTeamsQuantity(id: string) {
  const { data } = await api.get<{ id: string; teamsQuantity: number }>(`/shelters/${id}/teams-quantity`);
  return data;
}

// Endpoint 9: Deletar Shelter - DELETE /shelters/:id
export async function apiDeleteShelter(id: string) {
  await api.delete(`/shelters/${id}`);
}

// Endpoints de atribuição/remoção removidos - agora gerenciados via Teams

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
  const { data } = await api.get<{ id: string; user: UserPublicDto; team?: { id: string; name?: string } | null }>(`/teacher-profiles/${userId}`);
  return data;
}

export async function apiLoadLeaderOptions() {
  // Buscar todos os líderes fazendo múltiplas requisições paginadas
  let allLeaders: any[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const { data } = await api.get(`/leader-profiles?page=${page}&limit=50`);
    
    if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
      allLeaders.push(...data.items);
      hasMore = data.items.length === 50;
      page++;
    } else {
      hasMore = false;
    }
  }
  
  return allLeaders.map((c) => ({
    leaderProfileId: c.id,
    name: c.user?.name || c.user?.email || c.id,
  })) as LeaderOption[];
}

export async function apiLoadTeacherOptions() {
  // Usar o endpoint simplificado que retorna diretamente a lista
  const teachers = await apiListTeachersSimple();
  
  return teachers.map((t) => ({
    teacherProfileId: t.teacherProfileId,
    name: t.name,
    vinculado: t.vinculado,
  })) as TeacherOption[];
}

// Removido: TeacherSimpleApi agora é TeacherSimpleListDto no módulo de teachers

export type LeaderSimpleApi = {
  leaderProfileId: string;
  name: string;
  vinculado: boolean;
};

// Removido: apiListTeachersSimple agora está no módulo de teachers
// Use: import { apiListTeachersSimple } from "../../teachers/api";

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
    vinculado: !!l.team,
  }));
  
  return mapped;
}
