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
  number?: number;
  weekday?: string;
};

export type ShelterWithTeachers = ShelterSimple & {
  teachers?: MinimalTeacher[];
};

export type LeaderProfile = {
  id: string;
  active?: boolean;
  user: MinimalUser;
  shelters?: ShelterWithTeachers[];
  createdAt?: string;
  updatedAt?: string;
};

export type PageDto<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type LeaderFilters = {
  searchString: string;
  active: "all" | "active" | "inactive";
  hasShelters: "all" | "yes" | "no";
  shelterNumber?: number | "";
};
