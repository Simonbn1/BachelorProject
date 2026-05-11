import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveAbsence,
  fetchAdminAbsences,
  rejectAbsence,
  type AdminAbsence,
} from "../api/adminApi";
import "../../../shared/styles/admin.css";
import "../../../shared/styles/globals.css";

type AbsenceGroup = {
  key: string;
  first: AdminAbsence;
  last: AdminAbsence;
  days: number;
  items: AdminAbsence[];
};

function getTypeLabel(type: string) {
  switch (type) {
    case "VACATION":
      return "Ferie";
    case "SICKNESS":
      return "Sykdom";
    case "LEAVE":
      return "Permisjon";
    case "OTHER":
      return "Annet";
    default:
      return type;
  }
}

function getStatusLabel(status: AdminAbsence["status"]) {
  switch (status) {
    case "PENDING":
      return "Til behandling";
    case "APPROVED":
      return "Godkjent";
    case "REJECTED":
      return "Avvist";
    default:
      return status;
  }
}

function formatDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

function getNextWorkday(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);

  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function groupAbsences(absences: AdminAbsence[]): AbsenceGroup[] {
  const sorted = [...absences].sort((a, b) =>
    a.absenceDate.localeCompare(b.absenceDate),
  );

  const groups: AdminAbsence[][] = [];

  for (const absence of sorted) {
    const currentGroup = groups[groups.length - 1];
    const previous = currentGroup?.[currentGroup.length - 1];

    const sameRequest =
      previous &&
      previous.type === absence.type &&
      previous.status === absence.status &&
      (previous.description ?? "") === (absence.description ?? "") &&
      (previous.managerComment ?? "") === (absence.managerComment ?? "") &&
      getNextWorkday(previous.absenceDate) === absence.absenceDate;

    if (sameRequest) {
      currentGroup.push(absence);
    } else {
      groups.push([absence]);
    }
  }

  return groups
    .map((group) => ({
      key: `${group[0].id}-${group[group.length - 1].id}`,
      first: group[0],
      last: group[group.length - 1],
      days: group.length,
      items: group,
    }))
    .reverse();
}

export default function AdminAbsencesPage() {
  const navigate = useNavigate();

  const [absences, setAbsences] = useState<AdminAbsence[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentByKey, setCommentByKey] = useState<Record<string, string>>({});
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const groupedAbsences = useMemo(() => groupAbsences(absences), [absences]);

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

  async function handleApproveGroup(group: AbsenceGroup) {
    if (group.first.status !== "PENDING") return;

    setUpdatingKey(group.key);

    try {
      await Promise.all(
        group.items.map((absence) => approveAbsence(absence.id)),
      );
      await loadAbsences();
    } finally {
      setUpdatingKey(null);
    }
  }

  async function handleRejectGroup(group: AbsenceGroup) {
    if (group.first.status !== "PENDING") return;

    const comment = commentByKey[group.key] ?? "";

    setUpdatingKey(group.key);

    try {
      await Promise.all(
        group.items.map((absence) => rejectAbsence(absence.id, comment)),
      );
      await loadAbsences();
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-intro-header">
            <button
              type="button"
              className="page-back-button"
              onClick={() => navigate("/admin")}
            >
              ← Oversikt
            </button>

            <div className="admin-intro-text">
              <h1>Godkjenn fravær</h1>
              <p className="admin-subtitle">
                Se fraværsøknader og godkjenn eller avslå.
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="admin-info-card">Laster fravær...</div>}

      {!loading && groupedAbsences.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">🌴</div>
          <div>
            <h2>Ingen fraværsøknader</h2>
            <p>Det finnes ingen registrerte fraværsøknader enda.</p>
          </div>
        </div>
      )}

      {!loading && groupedAbsences.length > 0 && (
        <div className="admin-table-card">
          <table className="admin-table admin-absence-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Type</th>
                <th>Dager</th>
                <th>Status</th>
                <th>Beskrivelse</th>
                <th>Tilbakemelding</th>
                <th>Handling</th>
              </tr>
            </thead>

            <tbody>
              {groupedAbsences.map((group) => {
                const { first, last, days } = group;
                const isPending = first.status === "PENDING";
                const isUpdating = updatingKey === group.key;

                const dateLabel =
                  first.absenceDate === last.absenceDate
                    ? formatDate(first.absenceDate)
                    : `${formatDate(first.absenceDate)} – ${formatDate(
                        last.absenceDate,
                      )}`;

                return (
                  <tr key={group.key}>
                    <td>
                      <strong>{dateLabel}</strong>
                    </td>

                    <td>{getTypeLabel(first.type)}</td>

                    <td>
                      {days} {days === 1 ? "dag" : "dager"}
                    </td>

                    <td>
                      <span
                        className={`status-pill ${first.status.toLowerCase()}`}
                      >
                        {getStatusLabel(first.status)}
                      </span>
                    </td>

                    <td>{first.description || "—"}</td>

                    <td>
                      {isPending ? (
                        <input
                          className="admin-absence-comment-input"
                          placeholder="Kommentar ved avslag"
                          value={commentByKey[group.key] ?? ""}
                          onChange={(e) =>
                            setCommentByKey((prev) => ({
                              ...prev,
                              [group.key]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <span className="admin-muted">
                          {first.managerComment || "—"}
                        </span>
                      )}
                    </td>

                    <td>
                      {isPending ? (
                        <div className="admin-absence-actions">
                          <button
                            type="button"
                            className="admin-approve-button"
                            onClick={() => handleApproveGroup(group)}
                            disabled={isUpdating}
                          >
                            Godkjenn
                          </button>

                          <button
                            type="button"
                            className="admin-reject-button"
                            onClick={() => handleRejectGroup(group)}
                            disabled={isUpdating}
                          >
                            Avslå
                          </button>
                        </div>
                      ) : (
                        <span className="admin-muted">Ferdig behandlet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
