import api from "@/config/axiosConfig";
import type { LeaderProfile, ShelterSimple, PageDto, LeaderSimpleApi } from "./types";

export type ListLeadersParams = {
  page: number; 
  limit: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
  q?: string;
  active?: boolean;
  hasShelters?: boolean;
  shelterName?: string;
  searchString?: string;
};

export type ApiMessage = { message?: string };

export async function apiCreateLeaderForUser(userId: string) {
  const { data } = await api.post<LeaderProfile>(`/leader-profiles/create-for-user/${userId}`);
  return data;
}

export async function apiListLeaders(params: ListLeadersParams) {
  const { data } = await api.get<PageDto<LeaderProfile>>(
    "/leader-profiles",
    { params }
  );
  return data;
}

export async function apiListLeadersSimple() {
  const { data } = await api.get<LeaderSimpleApi[]>("/leader-profiles/simple");
  return data;
}

export async function apiGetLeader(leaderId: string) {
  const { data } = await api.get<LeaderProfile>(
    `/leader-profiles/${leaderId}`
  );
  return data;
}

export async function apiGetLeaderByShelter(shelterId: string) {
  const { data } = await api.get<LeaderProfile>(
    `/leader-profiles/by-shelter/${shelterId}`
  );
  return data;
}

export async function apiAssignShelter(
  leaderId: string,
  shelterId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/leader-profiles/${leaderId}/assign-shelter`,
    { shelterId }
  );
  return data;
}

export async function apiUnassignShelter(
  leaderId: string,
  shelterId?: string
): Promise<ApiMessage> {
  const payload = shelterId ? { shelterId } : {};
  const { data } = await api.patch<ApiMessage>(
    `/leader-profiles/${leaderId}/unassign-shelter`,
    payload
  );
  return data;
}

export async function apiMoveShelter(
  fromLeaderId: string,
  shelterId: string,
  toLeaderId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/leader-profiles/${fromLeaderId}/move-shelter`,
    { shelterId, toLeaderId }
  );
  return data;
}

export async function apiListSheltersSimple() {
  const { data } = await api.get<ShelterSimple[]>("/shelters/simple");
  return data;
}
