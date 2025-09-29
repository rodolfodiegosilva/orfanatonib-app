export const TZ = "America/Manaus";

export type MinimalUser = { id: string; name?: string; email?: string; phone?: string };

export type ShelterSimple = { 
  id: string; 
  name: string;
  leader?: {
    id: string;
    active: boolean;
    user: MinimalUser;
  } | null;
};

export type TeacherProfile = {
  id: string;
  active: boolean;
  user: MinimalUser;
  shelter?: ShelterSimple | null;
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
  searchString?: string; 
  q?: string;
  active?: boolean;
  hasShelter?: boolean;
  shelterName?: string;
  page?: number;
  limit?: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
};
