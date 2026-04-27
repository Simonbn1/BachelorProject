import { useState } from "react";
import { submitTimesheet } from "../api/timesheetsApi";
import type { MyTimesheet } from "../types/timesheet";
import { TimesheetPage } from "../pages/TimesheetPage";
import "../styles/TimesheetEditModal.css";

type Props = {
  opened: boolean;
  timesheet: MyTimesheet | null;
  onClose: () => void;
  onResubmitted?: () => void | Promise<void>;
};

export default function TimesheetEditModal({
  opened,
  timesheet,
  onClose,
  onResubmitted,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleResubmit() {
    if (!timesheet) return;

    try {
      setSubmitting(true);
      setError("");

      await submitTimesheet({ weekStart: timesheet.weekStart });
      await onResubmitted?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Kunne ikke sende inn på nytt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!opened || !timesheet) return null;

  return (
    <div className="timesheet-modal-overlay" onClick={onClose}>
      <div
        className="timesheet-modal timesheet-modal--page"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="timesheet-edit-modal-title"
      >
        <button
          className="timesheet-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Lukk"
        >
          ✕
        </button>

        {error && <div className="timesheet-modal__error-banner">{error}</div>}

        <div className="timesheet-modal__page-body">
          <TimesheetPage
            embedded
            hideBackButton
            hideWeekNavigation
            hideExports
            hideCalendarButton
            title="Rediger timeføring"
            subtitle="Oppdater timer for valgt uke og send inn på nytt."
            weekStartOverride={timesheet.weekStart}
          />
        </div>

        <div className="timesheet-modal__footer">
          <button
            type="button"
            className="timesheet-footer-button timesheet-footer-button--ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Lukk
          </button>

          {timesheet.status === "REJECTED" && (
            <button
              type="button"
              className="timesheet-footer-button timesheet-footer-button--primary"
              onClick={handleResubmit}
              disabled={submitting}
            >
              {submitting ? "Sender..." : "Send på nytt"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
