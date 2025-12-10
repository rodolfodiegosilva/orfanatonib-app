import api from "@/config/axiosConfig";
import { TeamResponseDto, CreateTeamDto, UpdateTeamDto, TeamSimpleDto } from "./types";

export async function apiListTeams(shelterId?: string) {
  const params = shelterId ? { shelterId } : {};
  const { data } = await api.get<TeamResponseDto[]>("/teams", { params });
  return data;
}

export async function apiGetTeam(teamId: string) {
  const { data } = await api.get<TeamResponseDto>(`/teams/${teamId}`);
  return data;
}

export async function apiGetTeamsByShelter(shelterId: string) {
  const { data } = await api.get<TeamResponseDto[]>(`/teams/by-shelter/${shelterId}`);
  return data;
}

export async function apiCreateTeam(payload: CreateTeamDto) {
  const { data } = await api.post<TeamResponseDto>("/teams", payload);
  return data;
}

export async function apiUpdateTeam(teamId: string, payload: UpdateTeamDto) {
  console.log(`🔴 [apiUpdateTeam] PUT /teams/${teamId}`);
  console.log(`🔴 [apiUpdateTeam] Payload:`, JSON.stringify(payload, null, 2));
  try {
    const response = await api.put<TeamResponseDto>(`/teams/${teamId}`, payload);
    console.log(`🔴 [apiUpdateTeam] Response Status:`, response.status);
    console.log(`🔴 [apiUpdateTeam] Response Headers:`, response.headers);
    console.log(`🔴 [apiUpdateTeam] Response Data:`, JSON.stringify(response.data, null, 2));
    
    // Verificar se a resposta está vazia ou incompleta
    if (!response.data || (!response.data.leaders && !response.data.teachers)) {
      console.warn(`⚠️ [apiUpdateTeam] Resposta do backend parece estar vazia ou incompleta!`);
      console.warn(`⚠️ [apiUpdateTeam] Payload enviado tinha:`, {
        leaderProfileIds: payload.leaderProfileIds?.length || 0,
        teacherProfileIds: payload.teacherProfileIds?.length || 0,
      });
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`❌ [apiUpdateTeam] Erro na requisição:`, error);
    console.error(`❌ [apiUpdateTeam] Erro response:`, error?.response?.data);
    console.error(`❌ [apiUpdateTeam] Erro status:`, error?.response?.status);
    throw error;
  }
}

export async function apiDeleteTeam(teamId: string) {
  await api.delete(`/teams/${teamId}`);
}

