import { useRouter } from "next/router";
import NavBar from "~/components/nav-bar";
import ProjectDetails from "~/components/projects/project-details";
import ProjectIPT from "~/components/projects/project-ipt";

function Project() {
  const router = useRouter();
  const { id: projectID } = router.query;
  const project = {
    id: 1,
    project_name: "Design-a-Box",
    contract_num: "FA8620-22-Z-1111",
    contract_status: "Closed",
    branch: "Modernization",
    contract_value: 4300,
    dependency_status: "ONTRACK",
    financial_status: "BEHIND",
    schedule_status: "REALLY-BEHIND",
    ccar_num: "1300",
    contractor_name: "RTX",
    requirement_type: "CDD",
    summary: "Designing a box to put things in.",
  }; // TODO: fetch project from database using projectID

  return (
    <>
      <NavBar />
      <main>
        {/* Top Section */}
        <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:justify-around sm:pt-6 lg:flex-row">
          {/* Left */}
          <ProjectDetails project={project} />

          {/* Right */}
          <ProjectIPT project={project} />
        </div>

        {/* Underneath Top Section */}
        <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:px-6 sm:pt-6"></div>
      </main>
    </>
  );
}

export default Project;
