import TopBar from "../../../shared/components/TopBar.tsx";
import "../../../features/timesheets/styles/TimesheetPage.css";

export default function AbsencePage() {
  return (
    <div className="page">
      <div className="timesheet-shell">
        <TopBar userName="Kari Nordmann" />

        <section className="timesheet-card">
          <div className="input-group-row">
            <label>Prosjekt:</label>
            <select className="dark-input">
              <option value="">Velg prosjekt...</option>
            </select>
          </div>

          <div className="input-group-row">
            <label>Oppgave/Ticket:</label>
            <input className="dark-input" placeholder="Oppgave/ticket" />
          </div>

          <hr className="modal-divider" />

          <div className="input-group-row">
            <label>Timer denne uka:</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {["Man", "Tir", "Ons", "Tor", "Fre"].map((day) => (
                <input
                  key={day}
                  className="dark-input"
                  placeholder={day}
                  style={{ width: "70px", textAlign: "center" }}
                />
              ))}
              <input
                className="dark-input"
                placeholder="Totalt"
                readOnly
                style={{ width: "100px", textAlign: "center" }}
              />
            </div>
          </div>

          <hr className="modal-divider" />

          <div style={{ display: "flex", gap: "40px", marginTop: "16px" }}>
            <div className="input-group-row">
              <label>Arbeidstype:</label>
              <select className="dark-input">
                <option value="">Velg kategori...</option>
              </select>
            </div>

            <div className="input-group-row">
              <label>Beskrivelse</label>
              <textarea
                className="dark-input"
                placeholder="Beskrivelse..."
              ></textarea>
            </div>
          </div>

          <div className="input-group-row">
            <label>Årsak til fravær:</label>
            <select className="dark-input">
              <option value="">Velg type...</option>
              <option value="syk">Sykdom</option>
              <option value="ferie">Ferie</option>
              <option value="permisjon">Permisjon</option>
              <option value="other">Annet</option>
            </select>
          </div>

          <div className="timesheet-actions">
            <div />
            <button className="save-btn" type="button">
              Lagre Timer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
