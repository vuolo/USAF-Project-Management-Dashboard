import { type NextPage } from "next";

import ProjectAdd from "~/components/projects/project-add";

const AddProject: NextPage = () => {
  return (
    <main>
      {/* Main Section */}
      <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
        <ProjectAdd />
      </div>
    </main>
  );
};

export default AddProject;
