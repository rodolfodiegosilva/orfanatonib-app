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

export type ShelterSimpleResponseDto = {
  id: string;
  name: string;
  address: AddressResponseDto;
  createdAt: string;
  updatedAt: string;
};

// Atualizado para suportar relacionamentos ManyToMany
export type ShelterResponseDto = {
  id: string;
  name: string;
  address: AddressResponseDto;
  leaders: LeaderMiniDto[]; // Mudou de leader? para leaders[]
  teachers: TeacherMiniDto[];
  createdAt: string;
  updatedAt: string;
};

export type SimpleShelterResponseDto = {
  id: string,
  detalhe: string,
  leader: boolean
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

// Atualizado para suportar múltiplos leaders
export type CreateShelterForm = {
  name: string;
  address: Partial<AddressResponseDto> & {
    street: string; district: string; city: string; state: string; postalCode: string;
  };
  leaderProfileIds?: string[]; // Mudou de leaderProfileId para leaderProfileIds[]
  teacherProfileIds?: string[];
};

export type EditShelterForm = Partial<CreateShelterForm> & { id: string };
export type UserLite = { id: string; name?: string; email?: string };

// Filtros simplificados conforme nova documentação
export type ShelterFilters = {
  // Filtros principais
  shelterName?: string; // Busca por nome do abrigo
  staffFilters?: string; // Busca em TODOS os campos de líderes e professores
  addressFilter?: string; // Busca em TODOS os campos de endereço
  
  // Filtros legados para compatibilidade (mantidos temporariamente)
  addressSearchString?: string;
  userSearchString?: string;
  shelterSearchString?: string;
  searchString?: string;
  city?: string;
  state?: string;
  leaderId?: string;
  teacherId?: string;
  hasLeaders?: boolean;
  hasTeachers?: boolean;
  leaderIds?: string[];
  teacherIds?: string[];
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
