import { useRouter } from "next/router";

import NavBar from "~/components/nav-bar";
import ProjectDetails from "~/components/projects/project-details";
import ProjectIPT from "~/components/projects/project-ipt";

import { api } from "~/utils/api";

function Project() {
  const router = useRouter();
  const id = parseInt(router.query.id as string);
  const { data: project } = api.project.get.useQuery({ id });

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
              <ProjectIPT project_id={id} />
            </div>

            {/* Underneath Top Section */}
            <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:px-6 sm:pt-6"></div>
          </>
        )}
      </main>
    </>
  );
}

export default Project;
