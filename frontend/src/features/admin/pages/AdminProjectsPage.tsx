import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminProjects, type AdminProject } from "../api/adminProjectsApi";
import "../../../shared/styles/admin.css";

export default function AdminProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminProjects();

        const sorted = [...data].sort((a, b) =>
          a.name.localeCompare(b.name, "no"),
        );

        setProjects(sorted);
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente prosjektene.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <button
            type="button"
            className="page-back-button"
            onClick={() => navigate("/admin")}
          >
            ← Tilbake til oversikt
          </button>

          <p className="admin-eyebrow">TIMEOPPFØLGING</p>
          <h1>Prosjekter</h1>
          <p className="admin-subtitle">
            Se alle tilgjengelige prosjekter i løsningen.
          </p>
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster prosjekter...</div>}

      {!loading && error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && projects.length > 0 && (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Prosjekt</th>
                <th>Kunde</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.customer || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">📁</div>
          <div>
            <h2>Ingen prosjekter funnet</h2>
            <p>Det finnes ingen registrerte prosjekter ennå.</p>
          </div>
        </div>
      )}
    </div>
  );
}
