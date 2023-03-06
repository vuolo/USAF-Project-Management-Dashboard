import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import NavBar from "~/components/nav-bar";
import ProjectContractStatus from "~/components/projects/project-contract-status";
import ProjectDependencies from "~/components/projects/project-dependencies";
import ProjectDetails from "~/components/projects/project-details";
import ProjectFunding from "~/components/projects/project-funding";
import ProjectIPT from "~/components/projects/project-ipt";
import ProjectSchedule from "~/components/projects/project-schedule";

import { api } from "~/utils/api";
import ModalConfirmProjectClose from "~/components/projects/modals/modal-confirm-project-close";

function Project() {
  const user = useSession().data?.db_user;
  const router = useRouter();
  const id = parseInt(router.query.id as string);
  const { data: project } = api.project.get_view.useQuery({ id });

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <NavBar />
      <main>
        {project && (
          <>
            {/* Top Section */}
            <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:justify-around sm:pt-6 lg:flex-row">
              {/* Left */}
              <ProjectDetails project={project} />

              {/* Right */}
              <ProjectIPT project={project} />
            </div>

            {/* Underneath Top Section */}
            <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:px-6 sm:pt-6">
              <ProjectDependencies project={project} />
              {(project.contract_status as string) === "Pre-Award" && (
                <ProjectContractStatus project={project} />
              )}
              {user?.user_role !== "Contractor" && (
                <ProjectFunding project={project} />
              )}
              <ProjectSchedule project={project} />

              {project.contract_status !== "Closed" &&
                user?.user_role === "Admin" && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
                  >
                    Close Project
                  </button>
                )}
            </div>
          </>
        )}

        {/* Confirm Close Project Modal */}
        <ModalConfirmProjectClose
          project={project}
          isOpen={showModal}
          setIsOpen={setShowModal}
        />
      </main>
    </>
  );
}

export default Project;
