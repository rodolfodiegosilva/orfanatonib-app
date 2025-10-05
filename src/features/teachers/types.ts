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
  teacherSearchString?: string;
  shelterSearchString?: string;
  hasShelter?: boolean;
  page?: number;
  limit?: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
};
