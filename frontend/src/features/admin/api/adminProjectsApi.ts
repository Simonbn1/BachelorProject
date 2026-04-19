import { api } from "../../../shared/api/client";

export type AdminProject = {
  id: number;
  name: string;
  customer: string | null;
};

export async function fetchAdminProjects(): Promise<AdminProject[]> {
  const response = await api.get<AdminProject[]>("/api/projects");
  return response.data;
}
