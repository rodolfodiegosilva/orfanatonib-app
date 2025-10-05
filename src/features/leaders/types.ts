export const TZ = "America/Manaus";

export type MinimalUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
  completed?: boolean;
  commonUser?: boolean;
};

export type MinimalTeacher = {
  id: string;
  active?: boolean;
  user?: MinimalUser;
};

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

export type ShelterWithTeachers = ShelterSimple & {
  teachers?: MinimalTeacher[];
};

export type LeaderProfile = {
  id: string;
  active: boolean;
  user: MinimalUser;
  shelter?: ShelterWithTeachers | null;
  createdAt: string;
  updatedAt: string;
};

export type PageDto<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type LeaderFilters = {
  leaderSearchString?: string;
  shelterSearchString?: string;
  hasShelter?: boolean;
  // Filtros legados (compatibilidade)
  searchString?: string;
  q?: string;
  active?: boolean;
  hasShelters?: boolean;
  shelterName?: string;
  page?: number;
  limit?: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
};
