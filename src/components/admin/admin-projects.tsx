import { api } from "~/utils/api";

function AdminProjects() {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Projects</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Projects</h1>
        <div className="mt-2">
          <h2 className="text-lg font-medium">Delete Project</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="project-name">Select:</label>
              <input
                type="text"
                id="project-name"
                name="project-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminProjects;
