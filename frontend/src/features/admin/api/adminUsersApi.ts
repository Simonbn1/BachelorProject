import { api } from "../../../shared/api/client";

export type AdminUser = {
  id: number;
  displayName: string;
  email: string;
  role: string;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>("/api/admin/users");
  return response.data;
}
