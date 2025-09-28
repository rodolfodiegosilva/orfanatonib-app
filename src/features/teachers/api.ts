import api from "@/config/axiosConfig";
import { TeacherProfile, ShelterSimple, Page, TeacherQuery } from "./types";

export async function apiListTeachers(params: TeacherQuery) {
  const { data } = await api.get<Page<TeacherProfile>>("/teacher-profiles", { params });
  return data;
}

export async function apiGetTeacher(teacherId: string) {
  const { data } = await api.get<TeacherProfile>(`/teacher-profiles/${teacherId}`);
  return data;
}

export async function apiAssignTeacherToShelter(teacherId: string, shelterId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/assign-shelter`, { shelterId });
}

export async function apiUnassignTeacherFromShelter(teacherId: string, shelterId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/unassign-shelter`, { shelterId });
}

export async function apiListSheltersSimple() {
  const { data } = await api.get<ShelterSimple[]>("/shelters/all");
  return data;
}
