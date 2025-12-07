export const TZ = "America/Manaus";

export type MinimalUser = { id: string; name?: string; email?: string; phone?: string };

export type ShelterSimple = { 
  id: string; 
  name: string;
  address?: {
    id: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

// Mantido para compatibilidade, mas TeacherProfile agora usa shelter diretamente
export type TeamSimple = {
  id: string;
  numberTeam: number; // ⭐ Número da equipe (1, 2, 3, 4...) - tipo NUMBER
  description?: string | null;
  shelterId: string;
  shelter?: ShelterSimple;
  createdAt: string;
  updatedAt: string;
};

// Tipo conforme documentação: TeacherResponseDto
export type TeacherProfile = {
  id: string;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    completed: boolean;
    commonUser: boolean;
  };
  shelter?: {
    id: string;
    name: string;
    team?: {
      id: string;
      numberTeam: number;
      description: string | null;
    };
    leader?: {
      id: string;
      active: boolean;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        active: boolean;
        completed: boolean;
        commonUser: boolean;
      };
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type TeacherQuery = {
  // Filtros principais (conforme documentação)
  teacherSearchString?: string; // Busca por nome, email ou telefone do professor
  shelterSearchString?: string; // Busca por dados do abrigo (nome, endereço, líder)
  hasShelter?: boolean; // Filtrar por professores vinculados a abrigos (true/false)
  teamId?: string; // Filtrar por ID da equipe específica
  teamName?: string; // Filtrar por nome/número da equipe (busca parcial)
  hasTeam?: boolean; // Filtrar por professores vinculados a equipes (true/false)
  page?: number;
  limit?: number;
  sort?: "updatedAt" | "createdAt" | "name"; // Padrão: updatedAt
  order?: "asc" | "desc"; // Padrão: desc
};

/**
 * Tipo simplificado para listagem de professores
 * Usado no endpoint GET /teacher-profiles/simple
 * Conforme documentação: TeacherSimpleListDto
 */
export type TeacherSimpleListDto = {
  teacherProfileId: string;  // UUID do perfil do professor
  name: string;              // Nome do usuário (ou email se não tiver nome, ou "—" se não tiver nenhum)
  vinculado: boolean;        // Se está vinculado a uma equipe/abrigo
};
