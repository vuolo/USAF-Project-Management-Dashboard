import { api } from "~/utils/api";

function ProjectIPT({ project_id }: { project_id: number }) {
  const { data: ipts } = api.user.getIptMembers.useQuery({ project_id });

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>IPT</h1>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        {ipts &&
          ipts.map((ipt) => (
            <p key={ipt.id}>
              <b>{ipt.mil_job_title}:</b> {ipt.user_name ?? "N/A"}
            </p>
          ))}
      </div>
    </div>
  );
}

export default ProjectIPT;
