import { api } from "~/utils/api";

import type { view_project } from "~/types/view_project";

function ProjectDependencies({ project }: { project: view_project }) {
  const { data: predecessors } = api.dependency.getPredecessors.useQuery({
    project_id: project.id,
  });

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Project Dependencies</h1>
        {project.contract_status !== "Closed" && (
          <button className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto">
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col justify-around gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6 md:flex-row">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="font-bold">Predecessors</h1>
          {!predecessors || predecessors.length == 0 ? (
            <p className="italic">
              There are no predecessors for this project.
            </p>
          ) : (
            <>{/* TODO: display a table visualizing the predecessors */}</>
          )}
        </div>
        <div>
          <h1 className="font-bold">Successors</h1>
        </div>
      </div>
    </div>
  );
}

export default ProjectDependencies;
