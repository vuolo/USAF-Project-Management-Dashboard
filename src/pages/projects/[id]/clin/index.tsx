import { type NextPage } from "next";
import { useRouter } from "next/router";

import ProjectClin from "~/components/projects/project-clin";

const Clin: NextPage = () => {
  const router = useRouter();
  const project_id = parseInt(router.query.id as string);

  return (
    <main>
      {/* Main Section */}
      <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
        <ProjectClin project_id={project_id} />
      </div>
    </main>
  );
};

export default Clin;
