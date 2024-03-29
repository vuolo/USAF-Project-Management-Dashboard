import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { view_project } from "~/types/view_project";
import { api } from "~/utils/api";
import ModalEditProjectDetails from "./modals/modal-edit-project-details";
import ModalUploadProjectProPricer from "./modals/modal-upload-project-pro-pricer";
import ModalDownloadProPricerTemplate from "./modals/modal-download-pro-pricer-template";
import { DownloadIcon } from "lucide-react";

function ProjectDetails({ project }: { project: view_project }) {
  const user = useSession().data?.db_user;
  const { data: contractors } = api.contractor.getAll.useQuery();
  const { data: branches } = api.branch.getAll.useQuery();
  const { data: requirementTypes } = api.requirement_type.getAll.useQuery();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Project Details</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" && (
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
            >
              Edit
            </button>
          )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
        <p>
          <b>Project Name:</b> {project.project_name || "N/A"}
        </p>
        <p>
          <b>Contract Number:</b> {project.contract_num || "N/A"}
        </p>
        <p>
          <b>Contract Status:</b> {project.contract_status || "N/A"}
        </p>
        <p>
          <b>CCAR Number:</b> {project.ccar_num || "N/A"}
        </p>
        <p>
          <b>Contractor:</b> {project.contractor_name || "N/A"}
        </p>
        <p>
          <b>Organization/Branch:</b> {project.branch || "N/A"}
        </p>
        <p>
          <b>Requirement Type:</b> {project.requirement_type || "N/A"}
        </p>
        <p>
          <b>Capability Summary:</b> {project.summary || "N/A"}
        </p>
      </div>

      <div className="mt-2 flex justify-evenly gap-4 px-6 lg:mt-[6.5rem]">
        <Link
          href={`/projects/${project.id}/clin`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          See CLIN Data
        </Link>

        {project.contract_status !== "Closed" && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Upload ProPricer
          </button>
        )}

        <button
          onClick={() => setDownloadModalOpen(true)}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          <DownloadIcon className="mr-2 h-5 w-5" />
          ProPricer Template
        </button>
      </div>

      {/* Edit Details Modal */}
      <ModalEditProjectDetails
        project={project}
        contractors={contractors}
        branches={branches}
        requirementTypes={requirementTypes}
        isOpen={editModalOpen}
        setIsOpen={setEditModalOpen}
      />

      {/* Upload ProPricer Modal */}
      <ModalUploadProjectProPricer
        project={project}
        isOpen={uploadModalOpen}
        setIsOpen={setUploadModalOpen}
      />

      {/* Download ProPricer Modal */}
      <ModalDownloadProPricerTemplate
        project={project}
        isOpen={downloadModalOpen}
        setIsOpen={setDownloadModalOpen}
      />
    </div>
  );
}

export default ProjectDetails;
