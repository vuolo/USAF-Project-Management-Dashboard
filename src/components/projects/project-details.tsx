import { Fragment, useCallback, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";
import { Info } from "lucide-react";

function ProjectDetails({ project }: { project: view_project }) {
  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput_projectName, setModalInput_projectName] = useState("");

  // Open modal
  const openModal = useCallback(() => {
    setModalInput_projectName(project.project_name);
    setModalOpen(true);
  }, [project]);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);

      if (save) {
        if (
          typeof modalInput_projectName !== "string"
          // TODO: add other modal inputs to check
        ) {
          toast.error(
            toastMessage(
              "Error renaming file.",
              "Please enter a valid file name."
            )
          );
          return;
        }

        // TODO: Update the project details in the database
      }

      // Reset the input
      setModalInput_projectName("");
      // TODO: add other modal inputs
    },
    [modalInput_projectName]
  );

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Project Details</h1>
        {project.contract_status !== "Closed" && (
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        <p>
          <b>Project Name:</b> {project.project_name ?? "N/A"}
        </p>
        <p>
          <b>Contract Number:</b> {project.contract_num ?? "N/A"}
        </p>
        <p>
          <b>Contract Status:</b> {project.contract_status ?? "N/A"}
        </p>
        <p>
          <b>CCAR Number:</b> {project.ccar_num ?? "N/A"}
        </p>
        <p>
          <b>Contractor:</b> {project.contractor_name ?? "N/A"}
        </p>
        <p>
          <b>Organization/Branch:</b> {project.branch ?? "N/A"}
        </p>
        <p>
          <b>Requirement Type:</b> {project.requirement_type ?? "N/A"}
        </p>
        <p>
          <b>Capability Summary:</b> {project.summary ?? "N/A"}
        </p>
      </div>

      <div className="mt-2 flex justify-evenly gap-4">
        <Link
          href={`/projects/${project.id}/clin`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          See CLIN Data
        </Link>
        {project.contract_status !== "Closed" && (
          <button className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Upload ProPricer
          </button>
        )}
      </div>

      {/* Edit Details Modal */}
      <Transition.Root show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            closeModal(false);
          }}
        >
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* TODO: find a better icon */}
                      <Info
                        className="h-6 w-6 text-indigo-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Project Details
                      </Dialog.Title>
                      <div className="mt-2 min-w-full">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeModal(true);
                          }}
                          className="mt-1 flex rounded-md shadow-sm"
                        >
                          {/* TODO: restyle this label */}
                          <label htmlFor="project-name">Project Name</label>
                          <input
                            type="text"
                            name="project-name"
                            id="project-name"
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-0 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Project name..."
                            value={modalInput_projectName}
                            onChange={(e) => {
                              setModalInput_projectName(e.target.value);
                            }}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(true)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default ProjectDetails;
