import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

import type { view_project } from "~/types/view_project";
import ModalEditProjectIPT from "./modals/modal-edit-project-ipt";
import ModalSeeProjectContractors from "./modals/modal-see-project-contractors";

function ProjectIPT({ project }: { project: view_project }) {
  const user = useSession().data?.db_user;
  const { data: ipt } = api.user.getIptMembers.useQuery({
    project_id: project.id,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [seeContractorsModalOpen, setSeeContractorsModalOpen] = useState(false);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between gap-32 rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>IPT</h1>
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

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        {ipt ? (
          ipt.length === 0 ? (
            <p className="mt-2 text-center italic sm:mt-0">
              This project has no IPT members.
            </p>
          ) : (
            ipt.map((ipt) => (
              <p key={ipt.id}>
                <b>{ipt.mil_job_title}:</b> {ipt.user_name ?? "N/A"}
              </p>
            ))
          )
        ) : (
          <p className="text-center italic">Loading...</p>
        )}
      </div>

      <div className="mt-2 flex justify-evenly gap-4 px-6">
        <button
          onClick={() => setSeeContractorsModalOpen(true)}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          See Contractors
        </button>
      </div>

      {/* Edit IPT Modal */}
      <ModalEditProjectIPT
        project={project}
        ipt={ipt}
        isOpen={editModalOpen}
        setIsOpen={setEditModalOpen}
      />

      {/* See Contractors Modal */}
      <ModalSeeProjectContractors
        project={project}
        isOpen={seeContractorsModalOpen}
        setIsOpen={setSeeContractorsModalOpen}
      />
    </div>
  );
}

export default ProjectIPT;
