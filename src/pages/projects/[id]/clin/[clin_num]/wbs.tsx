import { type NextPage } from "next";
import { useRouter } from "next/router";

import ProjectClinWBS from "~/components/projects/project-clin-wbs";

const WBS: NextPage = () => {
  const router = useRouter();
  const project_id = parseInt(router.query.id as string);
  const clin_num = parseInt(router.query.clin_num as string);

  return (
    <main>
      {/* Main Section */}
      <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
        <ProjectClinWBS project_id={project_id} clin_num={clin_num} />
      </div>
    </main>
  );
};

export default WBS;
