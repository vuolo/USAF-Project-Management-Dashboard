import { useRouter } from "next/router";

import NavBar from "~/components/nav-bar";
import ProjectContractStatus from "~/components/projects/project-contract-status";
import ProjectDependencies from "~/components/projects/project-dependencies";
import ProjectDetails from "~/components/projects/project-details";
import ProjectFunding from "~/components/projects/project-funding";
import ProjectIPT from "~/components/projects/project-ipt";
import ProjectSchedule from "~/components/projects/project-schedule";

import { api } from "~/utils/api";

function Project() {
  const router = useRouter();
  const id = parseInt(router.query.id as string);
  const { data: project } = api.project.get_view.useQuery({ id });

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
              <ProjectContractStatus project={project} />
              <ProjectFunding project={project} />
              <ProjectSchedule project={project} />

              {project.contract_status !== "Closed" && (
                // TODO: open a modal to confirm, before closing the project
                <button className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto">
                  Close Project
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Project;
