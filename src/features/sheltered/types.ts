export type ShelteredListItemDto = {
  id: string;
  name: string;
  guardianName: string;
  guardianPhone: string;
  shelterId: string | null;
};

export type ShelteredResponseDto = {
  id: string;
  name: string;
  gender: "masculino" | "feminino";
  guardianName: string;
  guardianPhone: string;
  birthDate: string;
  joinedAt: string | null;
  shelter: { id: string; name: string } | null;
  address: {
    id: string;
    street: string;
    number?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
  } | null;
  pagelas?: Array<{
    id: string;
    year: number;
    visit: number;
    referenceDate: string;
    present: boolean;
    notes: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AcceptedChristShortDto = {
  id: string;
  decision: "ACCEPTED" | "RECONCILED" | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
};

export type ShelteredSimpleResponseDto = {
  id: string;
  name: string;
  guardianName: string | null;
  gender: "masculino" | "feminino";
  guardianPhone: string | null;
  shelterId: string | null;
  acceptedChrists: AcceptedChristShortDto[];
};


export type Paginated<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
  };
  total?: number;
  page?: number;
  limit?: number;
  pageCount?: number;
};

export type ShelteredFilters = {
  // Filtros agrupados (novos)
  shelteredName?: string;
  shelterFilters?: string;
  addressFilter?: string;
  geographicSearchString?: string;
  gender?: "masculino" | "feminino";
  birthDateFrom?: string;
  birthDateTo?: string;
  joinedFrom?: string;
  joinedTo?: string;
  // Filtros legados (compatibilidade)
  searchString?: string;
  shelterId?: string;
  shelterName?: string;
  city?: string;
  state?: string;
  birthDate?: string;
  joinedAt?: string;
};

export type ShelteredSort =
  | { id: 'name' | 'birthDate' | 'joinedAt' | 'createdAt' | 'updatedAt'; desc: boolean }
  | null;

export type CreateShelteredForm = {
  name: string;
  gender: "masculino" | "feminino";
  guardianName: string;
  guardianPhone: string;
  birthDate: string;
  joinedAt?: string | null;
  shelterId?: string | null;
  address?: {
    street: string;
    number?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
  } | null;
};

export type EditShelteredForm = Partial<CreateShelteredForm> & { id: string };
