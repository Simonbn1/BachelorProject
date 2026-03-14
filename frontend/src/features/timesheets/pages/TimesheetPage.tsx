import { useEffect, useState } from "react";
import { fetchProjects } from "../../projects/api/projectsApi";
import type { Project } from "../../projects/types/projects";
import TopBar from "../../../shared/components/TopBar";

type HoursState = Record<string, string>;

export default function TimesheetPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
    const [hours, setHours] = useState<HoursState>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState("");

    useEffect(() => {
        fetchProjects().then((data) => {
            setProjects(data);
        });
    }, []);

    function handleChange(projectId: number, day: string, value: string) {
        const normalized = value.replace(",", ".");
        const key = `${projectId}-${day}`;

        if (normalized === "" || /^(\d+)?([.]\d{0,1})?$/.test(normalized)) {
            setHours((prev) => ({
                ...prev,
                [key]: value,
            }));
        }
    }

    function getNumericValue(projectId: number, day: string) {
        const raw = hours[`${projectId}-${day}`] ?? "0";
        return Number.parseFloat(raw.replace(",", ".")) || 0;
    }

    function getRowTotal(projectId: number) {
        const days = ["mon", "tue", "wed", "thu", "fri"];
        return days.reduce((sum, day) => sum + getNumericValue(projectId, day), 0);
    }

    const weekTotal = visibleProjects.reduce(
        (sum, project) => sum + getRowTotal(project.id),
        0
    );

    const weeklyTarget = 37.5;
    const progressPercent = Math.min((weekTotal / weeklyTarget) * 100, 100);

    function removeProject(projectId: number) {
        setVisibleProjects((prev) => prev.filter((project) => project.id !== projectId));
    }

    function addSelectedProject() {
        const projectId = Number(selectedProjectId);
        const projectToAdd = projects.find((project) => project.id === projectId);

        if (!projectToAdd) {
            return;
        }

        const alreadyExists = visibleProjects.some((project) => project.id === projectId);

        if (alreadyExists) {
            setIsAddModalOpen(false);
            setSelectedProjectId("");
            return;
        }

        setVisibleProjects((prev) => [...prev, projectToAdd]);
        setIsAddModalOpen(false);
        setSelectedProjectId("");
    }

    return (
        <div className="page">
            <div className="timesheet-shell">
                <TopBar userName="Kari Nordmann" />

                <section className="timesheet-card">
                    <div className="timesheet-header">
                        <div className="timesheet-header-left">
                            <div className="week-icon">🗓</div>

                            <div>
                                <h5>Uke 12</h5>
                                <div className="week-subtitle">16. mars - 22. mars</div>
                            </div>
                        </div>

                        <div className="timesheet-progress">
                            <div className="progress-text">
                                {weekTotal.toFixed(1).replace(".", ",")} / {weeklyTarget.toFixed(1).replace(".", ",")}
                            </div>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="timesheet-columns">
                        <span>Prosjekt</span>
                        <span>Man</span>
                        <span>Tir</span>
                        <span>Ons</span>
                        <span>Tor</span>
                        <span>Fre</span>
                        <span>Totalt antall timer</span>
                        <span></span>
                    </div>

                    {visibleProjects.map((project) => (
                        <div key={project.id} className="project-row">
                            <div className="project-name">
                                <strong>{project.name}</strong>
                                <span>Prosjekt #{project.id}</span>
                            </div>

                            <input
                                value={hours[`${project.id}-mon`] ?? ""}
                                placeholder="0,0"
                                onChange={(e) => handleChange(project.id, "mon", e.target.value)}
                            />
                            <input
                                value={hours[`${project.id}-tue`] ?? ""}
                                placeholder="0,0"
                                onChange={(e) => handleChange(project.id, "tue", e.target.value)}
                            />
                            <input
                                value={hours[`${project.id}-wed`] ?? ""}
                                placeholder="0,0"
                                onChange={(e) => handleChange(project.id, "wed", e.target.value)}
                            />
                            <input
                                value={hours[`${project.id}-thu`] ?? ""}
                                placeholder="0,0"
                                onChange={(e) => handleChange(project.id, "thu", e.target.value)}
                            />
                            <input
                                value={hours[`${project.id}-fri`] ?? ""}
                                placeholder="0,0"
                                onChange={(e) => handleChange(project.id, "fri", e.target.value)}
                            />

                            <div className="total">
                                {getRowTotal(project.id).toFixed(1).replace(".", ",")}
                            </div>

                            <button
                                className="delete-btn"
                                type="button"
                                aria-label="Slett rad"
                                onClick={() => removeProject(project.id)}
                            >
                                🗑
                            </button>
                        </div>
                    ))}

                    <button
                        className="add-project"
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + Legg til nytt prosjekt
                    </button>
                </section>
            </div>

            {isAddModalOpen && (
                <div className="wireframe-modal">
                    <div className="modal-content">
                        <button
                            className="close-btn"
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            ✕
                        </button>

                        <div className="input-group-row">
                            <label htmlFor="project-select">Prosjekt</label>

                            <select
                                id="project-select"
                                className="dark-input"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                <option value="">Velg prosjekt...</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="action-buttons">
                            <button className="save-btn" type="button" onClick={addSelectedProject}>
                                Legg til
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}