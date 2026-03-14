import type { Project } from "../../projects/types/projects";

type AddProjectModalProps = {
  projects: Project[];
  onClose: () => void;
};

export function AddProjectModal({ projects, onClose }: AddProjectModalProps) {
  return (
    <div className="wireframe-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
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
          </div>
        </div>

        <hr className="modal-divider" />

        <div className="bottom-fields">
          <div className="left-fields">
            <div className="input-group-row">
              <label>Arbeidstype:</label>
              <select className="dark-input">
                <option>Velg kategori</option>
              </select>
            </div>
          </div>

          <div className="input-group-row align top">
            <label>Beskrivelse:</label>
            <textarea className="dark-input description-input" />
          </div>
        </div>

        <div className="action-buttons">
          <button className="save-btn" onClick={onClose}>
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}
