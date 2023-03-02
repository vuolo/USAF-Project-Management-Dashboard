import Link from "next/link";
import type { view_project } from "~/types/view_project";

function ProjectDetails({ project }: { project: view_project }) {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Project Details</h1>
        {project.contract_status !== "Closed" && (
          <button className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto">
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        <p>
          <b>Project Name:</b> {project.project_name ?? "N/A"}
        </p>
        <p>
          <b>Contract Number:</b> {project.contract_num ?? "N/A"}
        </p>
        <p>
          <b>Contract Status:</b> {project.contract_status ?? "N/A"}
        </p>
        <p>
          <b>CCAR Number:</b> {project.ccar_num ?? "N/A"}
        </p>
        <p>
          <b>Contractor:</b> {project.contractor_name ?? "N/A"}
        </p>
        <p>
          <b>Organization/Branch:</b> {project.branch ?? "N/A"}
        </p>
        <p>
          <b>Requirement Type:</b> {project.requirement_type ?? "N/A"}
        </p>
        <p>
          <b>Capability Summary:</b> {project.summary ?? "N/A"}
        </p>
      </div>

      <Link
        href={`/projects/${project.id}/clin`}
        className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
      >
        See CLIN Data
      </Link>
    </div>
  );
}

export default ProjectDetails;
