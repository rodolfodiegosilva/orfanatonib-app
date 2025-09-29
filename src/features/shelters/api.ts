import api from "@/config/axiosConfig";
import {
  ShelterResponseDto, CreateShelterForm, EditShelterForm,
  LeaderMiniDto, TeacherOption, UserPublicDto,
  ShelterFilters, ShelterSort,
  LeaderOption,
  SimpleShelterResponseDto
} from "./types";
import { LeaderProfile } from "../leaders/types";
import { TeacherProfile } from "../teachers/types";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export async function apiFetchShelters(args: {
  page: number;
  limit: number;
  filters?: ShelterFilters;
  sort?: ShelterSort;
}) {
  const { page, limit, filters, sort } = args;
  const {
    addressSearchString,
    userSearchString,
    shelterSearchString,
  } = filters || {};

  const sortField = sort?.id ?? "updatedAt";
  const order = sort?.desc ? "DESC" : "ASC";

  const { data } = await api.get<PaginatedResponse<ShelterResponseDto>>("/shelters", {
    params: {
      page,
      limit,
      searchString: shelterSearchString || undefined,
      nameSearchString: shelterSearchString || undefined,
      sort: sortField,
      order,
    },
  });
  return data;
}

export async function apiFetchShelter(id: string) {
  const { data } = await api.get<ShelterResponseDto>(`/shelters/${id}`);
  return data;
}

export async function apiFetchSheltersList() {
  const { data } = await api.get<SimpleShelterResponseDto[]>(`/shelters/list`);
  return data;
}

export async function apiCreateShelter(payload: CreateShelterForm) {
  const { data } = await api.post<ShelterResponseDto>("/shelters", payload);
  return data;
}

export async function apiUpdateShelter(id: string, payload: Omit<EditShelterForm, "id">) {
  const { data } = await api.put<ShelterResponseDto>(`/shelters/${id}`, payload);
  return data;
}

export async function apiDeleteShelter(id: string) {
  await api.delete(`/shelters/${id}`);
}

export async function apiListUsersByRole(role: "leader" | "teacher", limit = 500) {
  const { data } = await api.get<{ items: { id: string; name?: string; email?: string }[] }>("/users", {
    params: { role, page: 1, limit, sort: "name", order: "ASC" },
  });
  return (Array.isArray(data?.items) ? data.items : []);
}

export async function apiGetLeaderProfile(userId: string) {
  const { data } = await api.get<LeaderMiniDto>(`/leader-profiles/${userId}`);
  return data;
}

export async function apiGetTeacherProfile(userId: string) {
  const { data } = await api.get<{ id: string; user: UserPublicDto; shelter?: { id: string; name?: string } | null }>(`/teacher-profiles/${userId}`);
  return data;
}

export async function apiLoadLeaderOptions() {
  const { data } = await api.get<LeaderProfile[]>("/leader-profiles");
  return data.map((c) => ({
    leaderProfileId: c.id,
    name: c.user?.name,
  })) as LeaderOption[];
}

export async function apiLoadTeacherOptions() {
  const { data } = await api.get<TeacherProfile[]>("/teacher-profiles");
  return data.map((t) => ({
    teacherProfileId: t.id,
    name: t.user?.name ?? t.user?.email ?? t.id,
    // Temporarily use id until types are fully updated
    assignedShelter: t.shelter?.name ?? t.shelter?.id ?? null,
    vinculado: !!t.shelter,
  })) as TeacherOption[];
}

export type TeacherSimpleApi = {
  teacherProfileId: string;
  name: string;
  vinculado: boolean;
};

export type LeaderSimpleApi = {
  leaderProfileId: string;
  name: string;
  vinculado: boolean;
};

export async function apiListTeachersSimple(): Promise<TeacherSimpleApi[]> {
  const { data } = await api.get<TeacherSimpleApi[]>("/teacher-profiles/simple");
  return data;
}

export async function apiListLeadersSimple(): Promise<LeaderSimpleApi[]> {
  const { data } = await api.get<LeaderSimpleApi[]>("/leader-profiles/simple");
  return data;
}
