import type { Project } from "../../projects/types/projects";

type TimesheetRowProps = {
  project: Project;
};

export function TimesheetRow({ project }: TimesheetRowProps) {
  return (
    <div className="project-row">
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
  );
}
