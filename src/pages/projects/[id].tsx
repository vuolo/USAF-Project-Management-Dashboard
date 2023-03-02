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
  const { data: project_view } = api.project.get_view.useQuery({ id });

  return (
    <>
      <NavBar />
      <main>
        {project_view && (
          <>
            {/* Top Section */}
            <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:justify-around sm:pt-6 lg:flex-row">
              {/* Left */}
              <ProjectDetails project={project_view} />

              {/* Right */}
              <ProjectIPT project={project_view} />
            </div>

            {/* Underneath Top Section */}
            <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:px-6 sm:pt-6">
              <ProjectDependencies project={project_view} />
              <ProjectContractStatus project={project_view} />
              <ProjectFunding project={project_view} />
              <ProjectSchedule project={project_view} />
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Project;
