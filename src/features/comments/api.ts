import api from "@/config/axiosConfig";
import { CommentData } from "store/slices/comment/commentsSlice";

export async function apiGetComments() {
  const { data } = await api.get<CommentData[]>("/comments");
  return data;
}

export async function apiDeleteComment(id: string) {
  await api.delete(`/comments/${id}`);
}

export async function apiPublishComment(c: CommentData) {
  await api.put(`/comments/${c.id}`, {
    name: c.name,
    comment: c.comment,
    shelterinho: c.shelterinho,
    neighborhood: c.neighborhood,
    published: true,
  });
}

export async function apiUpdateComment(c: CommentData, payload: {
  name: string;
  comment: string;
  shelterinho: string;
  neighborhood: string;
  published?: boolean; 
}) {
  await api.put(`/comments/${c.id}`, {
    name: payload.name,
    comment: payload.comment,
    shelterinho: payload.shelterinho,
    neighborhood: payload.neighborhood,
    published: payload.published ?? true,
  });
}
