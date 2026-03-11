import "./styles/Timeforing.css";
import { useEffect, useState } from "react";
import { fetchProjects, type Project } from "./api/projects";

function Timeforing() {
  const [isAdding, setIsAdding] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Kunne ikke hente prosjekter");
      });
  }, []);

  return (
    <div className="page">
      <nav className="navbar navbar-dark">
        <div className="container-fluid">
          <span className="navbar-brand">Accenture</span>
          <span className="user">User</span>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="timesheet-card">
          <div className="timesheet-header">
            <h5>Uke 12</h5>
            <span className="progress-text">30,0/37.5</span>
          </div>

          <div className="timesheet-columns">
            <span>Prosjekt</span>
            <span>Mandag</span>
            <span>Tirsdag</span>
            <span>Onsdag</span>
            <span>Torsdag</span>
            <span>Fredag</span>
            <span>Totalt</span>
          </div>

          {error && <p>{error}</p>}

          {projects.map((project) => (
            <div className="project-row" key={project.id}>
              <div className="project-name">
                <strong>{project.name}</strong>
                <span>Prosjekt #{project.id}</span>
              </div>

              <input defaultValue="0,0" />
              <input defaultValue="0,0" />
              <input defaultValue="0,0" />
              <input defaultValue="0,0" />
              <input defaultValue="0,0" />

              <div className="total">0,0</div>
            </div>
          ))}

          {!isAdding && (
            <button className="add-project" onClick={() => setIsAdding(true)}>
              + Legg til nytt prosjekt
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="wireframe-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsAdding(false)}>
              X
            </button>

            <div className="input-group-row">
              <label>Prosjekt</label>
              <select className="dark-input">
                <option>Velg prosjekt...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <hr className="modal-divider" />

            <div className="input-group-row">
              <label>Oppgave/Ticket:</label>
              <input className="dark-input" placeholder="Oppgave/Ticket" />
            </div>

            <hr className="modal-divider" />

            <div className="timer-section">
              <div className="timer-row">
                <label className="timer-label">Timer denne uka:</label>
                <div className="timer-inputs">
                  <input placeholder="Man" />
                  <input placeholder="Tir" />
                  <input placeholder="Ons" />
                  <input placeholder="Tor" />
                  <input placeholder="Fre" />
                </div>
                <div className="total-box">Totalt antall timer</div>
                <hr className="modal-divider" />
              </div>
            </div>

            <div className="bottom-fields">
              <div className="left-fields">
                <div className="input-group-row">
                  <label>Arbeidstype: </label>
                  <select className="dark-input">
                    <option>Velg kategori</option>
                  </select>
                </div>
              </div>

              <div className="input-group-row align top">
                <label>Beskrivelse: </label>
                <textarea className="dark-input description-input" />
              </div>
            </div>

            <div className="action-buttons">
              <button className="save-btn" onClick={() => setIsAdding(false)}>
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeforing;
