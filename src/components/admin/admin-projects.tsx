import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";

function AdminProjects() {
  const { data: projects } = api.project.list_view.useQuery();

  const [selectedProject, setSelectedProject] = useState<view_project>();

  const removeProject = api.project.delete.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Project",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      if (!data)
      {
        toast.error(
          toastMessage(
            "Error Removing Project",
            "Please try again later. If the problem persists, please contact support."
          )
        );
        return 
      }
      toast.success(
        toastMessage("Project Removed", "The project was removed successfully.")
      );
      projects?.splice(
        projects.findIndex((project) => project.id === data.id),
        1
      );
    },
  });

  const submitRemoveProject = () => {
    if (typeof selectedProject !== "object") {
      toast.error(
        toastMessage(
          "Error Removing Project",
          "Please make sure a project is selected."
        )
      );
      return;
    }

    removeProject.mutate({ id: selectedProject.id });
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Projects</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Projects</h1>

        {!projects ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            <div className="mt-2">
              <h2 className="text-lg font-medium">Delete Project</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="project-name">Select:</label>
                  <select
                    id="project-name"
                    name="project-name"
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                    value={selectedProject?.id}
                    onChange={(e) => {
                      setSelectedProject(
                        projects?.find(
                          (project) => project.id === Number(e.target.value)
                        )
                      );
                    }}
                  >
                    {/* <option value="">Select a project</option> */}
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={submitRemoveProject}
                className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminProjects;
