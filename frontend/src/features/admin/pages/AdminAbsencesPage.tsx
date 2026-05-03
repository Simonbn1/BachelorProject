import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveAbsence,
  fetchAdminAbsences,
  rejectAbsence,
  type AdminAbsence,
} from "../api/adminApi";
import "../../../shared/styles/admin.css";

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
    await Promise.all(group.items.map((absence) => approveAbsence(absence.id)));
    await loadAbsences();
  }

  async function handleRejectGroup(group: AbsenceGroup) {
    const comment = commentByKey[group.key] ?? "";

    await Promise.all(
      group.items.map((absence) => rejectAbsence(absence.id, comment)),
    );

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
          <table className="admin-table">
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
                      <input
                        className="admin-export-input"
                        placeholder="Kommentar ved avslag"
                        value={commentByKey[group.key] ?? ""}
                        onChange={(e) =>
                          setCommentByKey((prev) => ({
                            ...prev,
                            [group.key]: e.target.value,
                          }))
                        }
                      />
                    </td>

                    <td>
                      <div className="admin-detail-actions">
                        <button
                          type="button"
                          className="admin-approve-button"
                          onClick={() => handleApproveGroup(group)}
                          disabled={first.status === "APPROVED"}
                        >
                          Godkjenn
                        </button>

                        <button
                          type="button"
                          className="admin-reject-button"
                          onClick={() => handleRejectGroup(group)}
                          disabled={first.status === "REJECTED"}
                        >
                          Avslå
                        </button>
                      </div>
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
