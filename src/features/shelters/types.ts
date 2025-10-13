import { UserRole } from "@/store/slices/auth/authSlice";

export type UserPublicDto = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  completed: boolean;
  commonUser: boolean;
};

export type LeaderMiniDto = { 
  id: string; 
  active: boolean;
  user: UserPublicDto;
};

export type TeacherMiniDto = { 
  id: string; 
  active: boolean;
  user: UserPublicDto;
};

export type AddressResponseDto = {
  id: string;
  street: string;
  number?: string;
  district: string;
  city: string;
  state: string;
  postalCode: string;
  complement?: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaItemDto = {
  id: string;
  title: string;
  description?: string;
  mediaType: "image" | "video";
  uploadType: "upload" | "link";
  url: string;
  isLocalFile: boolean;
  platformType?: string | null;
  originalName?: string | null;
  size?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ShelterSimpleResponseDto = {
  id: string;
  name: string;
  description?: string | null;
  address: AddressResponseDto;
  mediaItem?: MediaItemDto | null;
  createdAt: string;
  updatedAt: string;
};

// Atualizado para suportar relacionamentos ManyToMany e mediaItem
export type ShelterResponseDto = {
  id: string;
  name: string;
  description?: string | null;
  address: AddressResponseDto;
  leaders: LeaderMiniDto[]; // Mudou de leader? para leaders[]
  teachers: TeacherMiniDto[];
  mediaItem?: MediaItemDto | null;
  createdAt: string;
  updatedAt: string;
};

export type SimpleShelterResponseDto = {
  id: string,
  detalhe: string,
  leader: boolean
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

// Atualizado para suportar múltiplos leaders, description e mediaItem
export type CreateShelterForm = {
  name: string;
  description?: string;
  address: Partial<AddressResponseDto> & {
    street: string; district: string; city: string; state: string; postalCode: string;
  };
  leaderProfileIds?: string[]; // Mudou de leaderProfileId para leaderProfileIds[]
  teacherProfileIds?: string[];
  mediaItem?: {
    title: string;
    description?: string;
    uploadType: "upload" | "link";
    url?: string; // Para link
    isLocalFile?: boolean;
    fieldKey?: string; // Para upload
  };
  file?: File; // Para upload de arquivo
};

export type EditShelterForm = Partial<CreateShelterForm> & { id: string };
export type UserLite = { id: string; name?: string; email?: string };

// Filtros conforme nova API
export type ShelterFilters = {
  searchString?: string; // Busca geral por nome, endereço, cidade, estado
  nameSearchString?: string; // Busca específica por nome do shelter
  leaderId?: string; // Filtrar por ID do líder
};

export type ShelterSort =
  | { id: "name" | "createdAt" | "updatedAt" | "city" | "state"; desc: boolean }
  | null;

export type LeaderOption = { leaderProfileId: string; name: string };
export type TeacherOption = { teacherProfileId: string; name: string, vinculado: boolean };

// Novos tipos para endpoints adicionais
export type ShelterListResponseDto = {
  id: string;
  name: string;
  address: AddressResponseDto;
  leaders: LeaderMiniDto[];
  teachers: TeacherMiniDto[];
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações de atribuição/remoção
export type AssignLeaderRequest = {
  shelterId: string;
};

export type UnassignLeaderRequest = {
  shelterId: string;
};

export type AssignTeacherRequest = {
  shelterId: string;
};

export type UnassignTeacherRequest = {
  shelterId: string;
};
