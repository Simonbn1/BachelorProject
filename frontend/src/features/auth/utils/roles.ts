import type { AuthUser } from "../types/auth";

export function isAdmin(user: AuthUser | null): boolean {
  return !!user?.roles?.includes("ADMIN");
}
