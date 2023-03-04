import { type NextPage } from "next";

import NavBar from "~/components/nav-bar";
import ProjectAdd from "~/components/projects/project-add";
import ProjectsOverview from "~/components/summaries/projects-overview";

const AddProject: NextPage = () => {
  return (
    <>
      <NavBar />
      <main>
        {/* Underneath Top Section */}
        <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
          <ProjectAdd />
        </div>
      </main>
    </>
  );
};

export default AddProject;
