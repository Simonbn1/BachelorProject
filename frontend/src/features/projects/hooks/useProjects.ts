import { useEffect, useState } from "react";
import { fetchProjects } from "../api/projectsApi";
import type { Project } from "../types/projects";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Kunne ikke hente prosjekter");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { projects, loading, error };
}
