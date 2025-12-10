import { UserRole } from "@/store/slices/auth/authSlice";
import { TeamWithMembersDto } from "../teams/types";

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
  teamsQuantity?: number; // Quantidade de equipes do abrigo (number) ⭐ NOVO
  address: AddressResponseDto;
  teams: TeamWithMembersDto[]; // Equipes do abrigo (sempre presente)
  mediaItem?: MediaItemDto | null;
  createdAt: string;
  updatedAt: string;
};

// Atualizado para suportar relacionamentos via Teams e mediaItem
export type ShelterResponseDto = {
  id: string;
  name: string;
  description?: string | null;
  teamsQuantity?: number; // Quantidade de equipes do abrigo (number) ⭐ NOVO
  address: AddressResponseDto;
  teams: TeamWithMembersDto[]; // NOVO: Equipes do abrigo
  leaders: LeaderMiniDto[]; // Calculado (agregação de todas as teams)
  teachers: TeacherMiniDto[]; // Calculado (agregação de todas as teams)
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

// Tipo para equipe no payload (conforme documentação atualizada)
export type TeamInputDto = {
  numberTeam: number; // Número da equipe (1, 2, 3... até teamsQuantity)
  description?: string; // Descrição da equipe (opcional)
  leaderProfileIds?: string[]; // Array de UUIDs dos perfis de líderes (opcional)
  teacherProfileIds?: string[]; // Array de UUIDs dos perfis de professores (opcional)
};

// Atualizado: Removidos leaderProfileIds e teacherProfileIds (agora via Teams)
// ⭐ NOVO: Campo teams opcional para vincular líderes/professores durante criação/atualização
export type CreateShelterForm = {
  name: string;
  description?: string;
  teamsQuantity: number; // Quantidade de equipes (number) ⭐ OBRIGATÓRIO
  teams?: TeamInputDto[]; // ⭐ Opcional - Permite vincular líderes/professores durante a criação
  address: Partial<AddressResponseDto> & {
    street: string; district: string; city: string; state: string; postalCode: string;
  };
  mediaItem?: {
    title?: string;
    description?: string;
    uploadType: "upload" | "link";
    url?: string; // Para link
  };
  file?: File; // Para upload de arquivo
};

export type EditShelterForm = Partial<CreateShelterForm> & { id: string };
export type UserLite = { id: string; name?: string; email?: string };

// Filtros conforme nova API
export type ShelterFilters = {
  // Filtros principais (conforme documentação)
  shelterName?: string; // Busca por nome do abrigo
  staffFilters?: string; // Busca por nome, email ou telefone de líderes/professores
  addressFilter?: string; // Busca por endereço (cidade, estado, bairro, etc.)
  teamId?: string; // Filtrar abrigos que têm uma equipe específica (UUID)
  teamName?: string; // Filtrar abrigos que têm equipes com nome/número específico (busca parcial)
  leaderId?: string; // Filtrar por líder específico
  
  // Filtros legados (compatibilidade)
  searchString?: string; // Busca geral por nome, endereço, cidade, estado
  nameSearchString?: string; // Busca específica por nome do shelter
  
  // Filtros internos (usados apenas no frontend)
  shelterSearchString?: string; // Mapeado para shelterName
  userSearchString?: string; // Mapeado para staffFilters
  addressSearchString?: string; // Mapeado para addressFilter
  city?: string; // Mapeado para addressFilter
  state?: string;
  teacherId?: string;
  hasLeaders?: boolean;
  hasTeachers?: boolean;
  leaderIds?: string[];
  teacherIds?: string[];
};

export type ShelterSort =
  | { id: "name" | "createdAt" | "updatedAt" | "city" | "state"; desc: boolean }
  | null;

export type LeaderOption = { leaderProfileId: string; name: string; vinculado: boolean };
export type TeacherOption = { teacherProfileId: string; name: string; vinculado: boolean };

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

// Tipo para resposta do endpoint teams-quantity
export type ShelterTeamsQuantityResponseDto = {
  id: string;
  teamsQuantity: number;
};
