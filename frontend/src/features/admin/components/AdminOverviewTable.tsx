import type { AdminTimesheetSummary } from "../types/admin";

type Props = {
  items: AdminTimesheetSummary[];
  onOpenDetails: (timesheetId: number) => void;
};

function getStatusLabel(status: AdminTimesheetSummary["status"]) {
  switch (status) {
    case "NOT_SENT":
      return "Ikke sendt";
    case "SENT":
      return "Sendt";
    case "APPROVED":
      return "Godkjent";
    case "REJECTED":
      return "Avvist";
    default:
      return status;
  }
}

function getStatusClass(status: AdminTimesheetSummary["status"]) {
  switch (status) {
    case "NOT_SENT":
      return "status-pill not-sent";
    case "SENT":
      return "status-pill sent";
    case "APPROVED":
      return "status-pill approved";
    case "REJECTED":
      return "status-pill rejected";
    default:
      return "status-pill";
  }
}

export default function AdminOverviewTable({ items, onOpenDetails }: Props) {
  if (items.length === 0) {
    return (
      <div className="admin-empty-state">
        Ingen timesheets funnet for valgt uke.
      </div>
    );
  }

  return (
    <div className="admin-table-card">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ansatt</th>
            <th>Timer</th>
            <th>Fravær</th>
            <th>Status</th>
            <th>Handling</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.timesheetId}>
              <td>
                <div className="admin-user-cell">
                  <span className="admin-user-name">{item.userName}</span>
                  {item.userEmail && (
                    <span className="admin-user-email">{item.userEmail}</span>
                  )}
                </div>
              </td>
              <td>{item.totalHours}</td>
              <td>{item.hasAbsence ? "Ja" : "Nei"}</td>
              <td>
                <span className={getStatusClass(item.status)}>
                  {getStatusLabel(item.status)}
                </span>
              </td>
              <td>
                <button
                  className="admin-secondary-button"
                  onClick={() => onOpenDetails(item.timesheetId)}
                >
                  Se detaljer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
