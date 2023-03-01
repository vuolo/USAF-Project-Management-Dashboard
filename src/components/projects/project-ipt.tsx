// TODO: set type for project using db schema
function ProjectIPT({ project }: { project: any }) {
  const ipt = {
    id: 1,
    project_id: 1,
    user_name: "Kat",
    mil_job_title: "Primary Logistics",
  }; // TODO: fetch IPT data from database using project.id

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>IPT</h1>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        <p>
          <b>{ipt.mil_job_title}:</b> {ipt.user_name ?? "N/A"}
        </p>
      </div>
    </div>
  );
}

export default ProjectIPT;
