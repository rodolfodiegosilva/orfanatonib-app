import api from "@/config/axiosConfig";
import { TeacherProfile, ShelterSimple, Page, TeacherQuery, TeacherSimpleApi } from "./types";

export async function apiListTeachers(params: TeacherQuery) {
  const { data } = await api.get<Page<TeacherProfile>>("/teacher-profiles", { params });
  return data;
}

export async function apiGetTeacher(teacherId: string) {
  const { data } = await api.get<TeacherProfile>(`/teacher-profiles/${teacherId}`);
  return data;
}

export async function apiListTeachersSimple() {
  const { data } = await api.get<TeacherSimpleApi[]>("/teacher-profiles/simple");
  return data;
}

export async function apiListTeachersByShelter(shelterId: string) {
  const { data } = await api.get<TeacherProfile[]>(`/teacher-profiles/by-shelter/${shelterId}`);
  return data;
}

export async function apiAssignTeacherToShelter(teacherId: string, shelterId: string) {
  await api.patch(`/teacher-profiles/${teacherId}/assign-shelter`, { shelterId });
}

export async function apiUnassignTeacherFromShelter(teacherId: string, shelterId?: string) {
  const payload = shelterId ? { shelterId } : {};
  await api.patch(`/teacher-profiles/${teacherId}/unassign-shelter`, payload);
}

export async function apiListSheltersSimple() {
  const { data } = await api.get<ShelterSimple[]>("/shelters/list");
  return data;
}
