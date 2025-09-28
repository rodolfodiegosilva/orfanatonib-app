import { UserRole } from "@/store/slices/auth/authSlice";

export type Weekday =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";

export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

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

export type LeaderMiniDto = { id: string; user: UserPublicDto };
export type TeacherMiniDto = { id: string; user: UserPublicDto };

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
  number: number;
  weekday: Weekday;
  time?: string | null;
  address: AddressResponseDto;
  createdAt: string;
  updatedAt: string;
};

export type ShelterResponseDto = {
  id: string;
  number: number;
  weekday: Weekday;
  time?: string | null;
  address: AddressResponseDto;
  leader?: LeaderMiniDto | null;
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

export type CreateShelterForm = {
  number: number;
  weekday: Weekday;
  time?: string | null;
  address: Partial<AddressResponseDto> & {
    street: string; district: string; city: string; state: string; postalCode: string;
  };
  leaderProfileId?: string | null;
  teacherProfileIds?: string[];
};

export type EditShelterForm = Partial<CreateShelterForm> & { id: string };
export type UserLite = { id: string; name?: string; email?: string };

export type ShelterFilters = {
  addressSearchString?: string;
  userSearchString?: string;
  shelterSearchString?: string;
};

export type ShelterSort =
  | { id: "number" | "weekday" | "time" | "createdAt" | "updatedAt" | "city" | "state"; desc: boolean }
  | null;

export type LeaderOption = { leaderProfileId: string; name: string };
export type TeacherOption = { teacherProfileId: string; name: string, vinculado: boolean };
