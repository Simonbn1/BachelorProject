import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminUsers, type AdminUser } from "../api/adminUsersApi";
import "../../../shared/styles/admin.css";

export default function AdminEmployeesPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Kunne ikke hente ansatte.");
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

          <h1>Ansatte</h1>
          <p className="admin-subtitle">
            Se brukere, roller og administrativ informasjon.
          </p>
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster ansatte...</div>}

      {!loading && error && <div className="admin-error-card">{error}</div>}

      {!loading && !error && users.length > 0 && (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Navn</th>
                <th>E-post</th>
                <th>Rolle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="admin-info-card">Ingen ansatte funnet.</div>
      )}
    </div>
  );
}
