import { api } from "./client";

export type Project = { id: number; name: string };

export async function fetchProjects(): Promise<Project[]> {
  const res = await api.get<Project[]>("/api/projects");
  return res.data;
}
