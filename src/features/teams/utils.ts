import { apiGetTeam, apiUpdateTeam } from "./api";
import { TeamResponseDto, UpdateTeamDto } from "./types";

/**
 * Adiciona um líder a uma equipe existente
 * Busca a equipe atual, adiciona o novo líder e atualiza
 */
export async function addLeaderToTeam(teamId: string, leaderId: string): Promise<TeamResponseDto> {
  // 1. Buscar a equipe atual
  const team = await apiGetTeam(teamId);
  
  // 2. Extrair IDs dos líderes atuais
  const currentLeaderIds = team.leaders.map((l) => l.id);
  
  // 3. Verificar se o líder já está na equipe
  if (currentLeaderIds.includes(leaderId)) {
    return team; // Já está na equipe, retornar sem alterações
  }
  
  // 4. Adicionar o novo líder
  const updatedLeaderIds = [...currentLeaderIds, leaderId];
  
  // 5. Atualizar a equipe
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: updatedLeaderIds,
  });
}

/**
 * Remove um líder de uma equipe existente
 * Busca a equipe atual, remove o líder e atualiza
 */
export async function removeLeaderFromTeam(teamId: string, leaderId: string): Promise<TeamResponseDto> {
  // 1. Buscar a equipe atual
  const team = await apiGetTeam(teamId);
  
  // 2. Extrair IDs dos líderes atuais
  const currentLeaderIds = team.leaders.map((l) => l.id);
  
  // 3. Remover o líder específico
  const updatedLeaderIds = currentLeaderIds.filter((id) => id !== leaderId);
  
  // 4. Atualizar a equipe
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: updatedLeaderIds,
  });
}

/**
 * Adiciona um professor a uma equipe existente
 * Busca a equipe atual, adiciona o novo professor e atualiza
 */
export async function addTeacherToTeam(teamId: string, teacherId: string): Promise<TeamResponseDto> {
  // 1. Buscar a equipe atual
  const team = await apiGetTeam(teamId);
  
  // 2. Extrair IDs dos professores atuais
  const currentTeacherIds = team.teachers.map((t) => t.id);
  
  // 3. Verificar se o professor já está na equipe
  if (currentTeacherIds.includes(teacherId)) {
    return team; // Já está na equipe, retornar sem alterações
  }
  
  // 4. Adicionar o novo professor
  const updatedTeacherIds = [...currentTeacherIds, teacherId];
  
  // 5. Atualizar a equipe
  return await apiUpdateTeam(teamId, {
    teacherProfileIds: updatedTeacherIds,
  });
}

/**
 * Remove um professor de uma equipe existente
 * Busca a equipe atual, remove o professor e atualiza
 */
export async function removeTeacherFromTeam(teamId: string, teacherId: string): Promise<TeamResponseDto> {
  // 1. Buscar a equipe atual
  const team = await apiGetTeam(teamId);
  
  // 2. Extrair IDs dos professores atuais
  const currentTeacherIds = team.teachers.map((t) => t.id);
  
  // 3. Remover o professor específico
  const updatedTeacherIds = currentTeacherIds.filter((id) => id !== teacherId);
  
  // 4. Atualizar a equipe
  return await apiUpdateTeam(teamId, {
    teacherProfileIds: updatedTeacherIds,
  });
}

/**
 * Adiciona múltiplos líderes a uma equipe existente
 */
export async function addLeadersToTeam(teamId: string, leaderIds: string[]): Promise<TeamResponseDto> {
  const team = await apiGetTeam(teamId);
  const currentLeaderIds = team.leaders.map((l) => l.id);
  
  // Adicionar apenas os que ainda não estão na equipe
  const newLeaderIds = leaderIds.filter((id) => !currentLeaderIds.includes(id));
  const updatedLeaderIds = [...currentLeaderIds, ...newLeaderIds];
  
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: updatedLeaderIds,
  });
}

/**
 * Adiciona múltiplos professores a uma equipe existente
 */
export async function addTeachersToTeam(teamId: string, teacherIds: string[]): Promise<TeamResponseDto> {
  const team = await apiGetTeam(teamId);
  const currentTeacherIds = team.teachers.map((t) => t.id);
  
  // Adicionar apenas os que ainda não estão na equipe
  const newTeacherIds = teacherIds.filter((id) => !currentTeacherIds.includes(id));
  const updatedTeacherIds = [...currentTeacherIds, ...newTeacherIds];
  
  return await apiUpdateTeam(teamId, {
    teacherProfileIds: updatedTeacherIds,
  });
}

/**
 * Remove múltiplos líderes de uma equipe existente
 */
export async function removeLeadersFromTeam(teamId: string, leaderIds: string[]): Promise<TeamResponseDto> {
  const team = await apiGetTeam(teamId);
  const currentLeaderIds = team.leaders.map((l) => l.id);
  
  const updatedLeaderIds = currentLeaderIds.filter((id) => !leaderIds.includes(id));
  
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: updatedLeaderIds,
  });
}

/**
 * Remove múltiplos professores de uma equipe existente
 */
export async function removeTeachersFromTeam(teamId: string, teacherIds: string[]): Promise<TeamResponseDto> {
  const team = await apiGetTeam(teamId);
  const currentTeacherIds = team.teachers.map((t) => t.id);
  
  const updatedTeacherIds = currentTeacherIds.filter((id) => !teacherIds.includes(id));
  
  return await apiUpdateTeam(teamId, {
    teacherProfileIds: updatedTeacherIds,
  });
}

/**
 * Substitui todos os líderes de uma equipe
 */
export async function replaceLeadersInTeam(teamId: string, leaderIds: string[]): Promise<TeamResponseDto> {
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: leaderIds,
  });
}

/**
 * Substitui todos os professores de uma equipe
 */
export async function replaceTeachersInTeam(teamId: string, teacherIds: string[]): Promise<TeamResponseDto> {
  return await apiUpdateTeam(teamId, {
    teacherProfileIds: teacherIds,
  });
}

/**
 * Limpa uma equipe (remove todos os líderes e professores)
 */
export async function clearTeam(teamId: string): Promise<TeamResponseDto> {
  return await apiUpdateTeam(teamId, {
    leaderProfileIds: [],
    teacherProfileIds: [],
  });
}

