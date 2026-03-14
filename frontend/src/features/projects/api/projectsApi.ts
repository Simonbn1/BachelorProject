import type { Project } from "../types/projects";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function fetchProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE_URL}/api/projects`);

    if (!res.ok) {
        throw new Error("Failed to fetch projects");
    }

    return res.json();
}