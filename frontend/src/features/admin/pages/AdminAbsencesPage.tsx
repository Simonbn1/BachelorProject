import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveAbsence,
  fetchAdminAbsences,
  rejectAbsence,
  type AdminAbsence,
} from "../api/adminApi";
import "../../../shared/styles/admin.css";

export default function AdminAbsencesPage() {
  const navigate = useNavigate();

  const [absences, setAbsences] = useState<AdminAbsence[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentById, setCommentById] = useState<Record<number, string>>({});

  async function loadAbsences() {
    setLoading(true);
    try {
      const data = await fetchAdminAbsences();
      setAbsences(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAbsences();
  }, []);

  async function handleApprove(id: number) {
    await approveAbsence(id);
    await loadAbsences();
  }

  async function handleReject(id: number) {
    await rejectAbsence(id, commentById[id] ?? "");
    await loadAbsences();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <button
            type="button"
            className="admin-back-link"
            onClick={() => navigate("/admin")}
          >
            ← Oversikt
          </button>

          <h1>Godkjenn fravær</h1>
          <p className="admin-subtitle">
            Se fraværsøknader og godkjenn eller avslå.
          </p>
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster fravær...</div>}

      {!loading && absences.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">🌴</div>
          <div>
            <h2>Ingen fraværsøknader</h2>
            <p>Det finnes ingen registrerte fraværsøknader enda.</p>
          </div>
        </div>
      )}

      {!loading && absences.length > 0 && (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Dato</th>
                <th>Type</th>
                <th>Timer</th>
                <th>Status</th>
                <th>Beskrivelse</th>
                <th>Tilbakemelding</th>
                <th>Handling</th>
              </tr>
            </thead>

            <tbody>
              {absences.map((absence) => (
                <tr key={absence.id}>
                  <td>{absence.absenceDate}</td>
                  <td>{absence.type}</td>
                  <td>{absence.hours}t</td>
                  <td>
                    <span
                      className={`status-pill ${absence.status.toLowerCase()}`}
                    >
                      {absence.status}
                    </span>
                  </td>
                  <td>{absence.description || "—"}</td>
                  <td>
                    <input
                      className="admin-export-input"
                      placeholder="Kommentar ved avslag"
                      value={commentById[absence.id] ?? ""}
                      onChange={(e) =>
                        setCommentById((prev) => ({
                          ...prev,
                          [absence.id]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <div className="admin-detail-actions">
                      <button
                        type="button"
                        className="admin-approve-button"
                        onClick={() => handleApprove(absence.id)}
                        disabled={absence.status === "APPROVED"}
                      >
                        Godkjenn
                      </button>

                      <button
                        type="button"
                        className="admin-reject-button"
                        onClick={() => handleReject(absence.id)}
                        disabled={absence.status === "REJECTED"}
                      >
                        Avslå
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
