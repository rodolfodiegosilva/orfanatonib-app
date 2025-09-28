import api from "@/config/axiosConfig";
import type { LeaderProfile, ShelterSimple, PageDto } from "./types";

export type ListLeadersParams = {
  page: number; 
  limit: number;
  sort?: "updatedAt" | "createdAt" | "name";
  order?: "asc" | "desc";
  q?: string;
  active?: boolean;
  hasShelters?: boolean;
  shelterNumber?: number;
  searchString?: string;
};

export type ApiMessage = { message?: string };

export async function apiListLeaders(params: ListLeadersParams) {
  const { data } = await api.get<PageDto<LeaderProfile>>(
    "/leader-profiles",
    { params }
  );
  return data;
}

export async function apiGetLeader(leaderId: string) {
  const { data } = await api.get<LeaderProfile>(
    `/leader-profiles/${leaderId}`
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
  shelterId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/leader-profiles/${leaderId}/unassign-shelter`,
    { shelterId }
  );
  return data;
}

export async function apiMoveShelter(
  fromLeaderId: string,
  shelterId: string,
  toLeaderProfileId: string
): Promise<ApiMessage> {
  const { data } = await api.patch<ApiMessage>(
    `/leader-profiles/${fromLeaderId}/move-shelter`,
    { shelterId, toLeaderProfileId }
  );
  return data;
}

export async function apiListSheltersSimple() {
  const { data } = await api.get<ShelterSimple[]>("/shelters/all");
  return data;
}
