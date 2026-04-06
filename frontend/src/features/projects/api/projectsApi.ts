import type { Project } from "../types/projects";
import { api } from "../../../shared/api/client";

export async function fetchProjects(): Promise<Project[]> {
    const res = await api.get("/api/projects");
    return res.data;
}