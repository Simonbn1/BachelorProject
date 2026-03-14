import { useEffect, useState } from "react";
import { fetchProjects } from "../../projects/api/projectsApi";
import type { Project } from "../../projects/types/projects";

export default function TimesheetPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [hours, setHours] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchProjects().then(setProjects);
    }, []);

    function handleChange(projectId: number, day: string, value: string) {
        const key = `${projectId}-${day}`;
        setHours({
            ...hours,
            [key]: parseFloat(value) || 0
        });
    }

    function getTotal(projectId: number) {
        const days = ["mon", "tue", "wed", "thu", "fri"];
        return days.reduce((sum, day) => {
            return sum + (hours[`${projectId}-${day}`] || 0);
        }, 0);
    }

    return (
        <div className="timesheet-container">
            <h2>Uke 12</h2>

            <div className="timesheet-header">
                <div>Prosjekt</div>
                <div>Mandag</div>
                <div>Tirsdag</div>
                <div>Onsdag</div>
                <div>Torsdag</div>
                <div>Fredag</div>
                <div>Totalt</div>
            </div>

            {projects.map((project) => (
                <div key={project.id} className="timesheet-row">
                    <div className="project-name">
                        {project.name}
                        <div className="project-id">Prosjekt #{project.id}</div>
                    </div>

                    <input
                        type="number"
                        step="0.5"
                        onChange={(e) => handleChange(project.id, "mon", e.target.value)}
                    />

                    <input
                        type="number"
                        step="0.5"
                        onChange={(e) => handleChange(project.id, "tue", e.target.value)}
                    />

                    <input
                        type="number"
                        step="0.5"
                        onChange={(e) => handleChange(project.id, "wed", e.target.value)}
                    />

                    <input
                        type="number"
                        step="0.5"
                        onChange={(e) => handleChange(project.id, "thu", e.target.value)}
                    />

                    <input
                        type="number"
                        step="0.5"
                        onChange={(e) => handleChange(project.id, "fri", e.target.value)}
                    />

                    <div>{getTotal(project.id)}</div>
                </div>
            ))}
        </div>
    );
}