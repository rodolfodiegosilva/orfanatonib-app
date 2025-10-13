// Tipos para o PagelaSheltersManager

export interface ShelterDto {
  id: string;
  name: string;
  address: {
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
  leader: {
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
  };
  teachers: Array<{
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
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ShelteredDto {
  id: string;
  name: string;
  birthDate: string;
  guardianName?: string;
  gender: string;
  guardianPhone?: string;
  joinedAt: string;
  shelter: {
    id: string;
    name: string;
  };
  address: {
    id: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PagelaDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  shelteredId: string;
  teacherProfileId: string;
  referenceDate: string;
  year: number;
  visit: number;
  present: boolean;
  notes?: string;
}

// Responses das APIs
export interface SheltersResponse {
  items: ShelterDto[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface ShelteredResponse {
  data: ShelteredDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    orderBy: string;
    order: string;
  };
}

export interface PagelasResponse {
  items: PagelaDto[];
  total: number;
  page: number;
  limit: number;
}

// Filtros para as APIs
export interface SheltersFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  searchString?: string;
  nameSearchString?: string;
  leaderId?: string;
}

export interface ShelteredFilters {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  searchString?: string;
  shelterId?: string;
  shelterName?: string;
  shelteredName?: string;
  city?: string;
  state?: string;
  gender?: string;
  birthDate?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
  joinedAt?: string;
  joinedFrom?: string;
  joinedTo?: string;
}

export interface PagelasFilters {
  page?: number;
  limit?: number;
  searchString?: string;
  shelteredId?: string;
  year?: number;
  visit?: number;
  present?: boolean;
}
