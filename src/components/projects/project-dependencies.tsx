import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { api } from "~/utils/api";

import type { view_project } from "~/types/view_project";
import ModalEditProjectDependencies from "./modals/modal-edit-project-dependencies";

function ProjectDependencies({ project }: { project: view_project }) {
  const user = useSession().data?.db_user;
  const { data: predecessors } = api.dependency.getPredecessors.useQuery({
    project_id: project.id,
  });
  const { data: successors } = api.dependency.getSuccessors.useQuery({
    project_id: project.id,
  });

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Dependencies</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
            >
              {(!predecessors && !successors) ||
              (predecessors?.length === 0 && successors?.length === 0)
                ? "Add"
                : "Edit"}
            </button>
          )}
      </div>

      <div className="flex flex-col justify-around gap-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6 lg:flex-row">
        {(!predecessors && !successors) ||
        (predecessors?.length === 0 && successors?.length === 0) ? (
          <p className="text-center italic">
            This project has no dependencies.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4 overflow-auto p-2 text-center">
              <h1 className="font-bold">Predecessors</h1>
              {!predecessors || predecessors.length === 0 ? (
                <p className="italic">
                  There are no predecessors for this project.
                </p>
              ) : (
                <div className="mt-2 flex flex-col">
                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        {!predecessors ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="italic text-gray-500">
                              Loading...
                            </div>
                          </div>
                        ) : predecessors.length === 0 ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="italic text-gray-500">
                              There are no predecessors for this project.
                            </div>
                          </div>
                        ) : (
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                >
                                  #
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Predecessor Project
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Milestone
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  End Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Current Project
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Milestone
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Start Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {predecessors &&
                                predecessors.map(
                                  (predecessor, predecessorIdx) => (
                                    <tr
                                      key={predecessorIdx}
                                      className={
                                        predecessorIdx % 2 === 0
                                          ? undefined
                                          : "bg-gray-50"
                                      }
                                    >
                                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                        {predecessorIdx + 1}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-black">
                                        {predecessor.predecessor_name}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {predecessor.predecessor_task_name}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {predecessor.predecessor_task_end_date
                                          ? format(
                                              new Date(
                                                predecessor.predecessor_task_end_date
                                              ),
                                              "MM/dd/yyyy"
                                            )
                                          : "..."}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-black">
                                        {predecessor.dep_proj_name}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {predecessor.successor_task_name}
                                      </td>
                                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {predecessor.successor_task_start_date
                                          ? format(
                                              new Date(
                                                predecessor.predecessor_task_end_date
                                              ),
                                              "MM/dd/yyyy"
                                            )
                                          : "..."}
                                      </td>
                                    </tr>
                                  )
                                )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 overflow-auto p-2 text-center">
              <h1 className="font-bold">Successors</h1>
              {!successors || successors.length === 0 ? (
                <p className="italic">
                  There are no successors for this project.
                </p>
              ) : (
                <div className="mt-2 flex flex-col">
                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        {!successors ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="italic text-gray-500">
                              Loading...
                            </div>
                          </div>
                        ) : successors.length === 0 ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="italic text-gray-500">
                              There are no successors for this project.
                            </div>
                          </div>
                        ) : (
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                >
                                  #
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Current Project
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Milestone
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  End Date
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Successor Project
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Milestone
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                >
                                  Start Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {successors &&
                                successors.map((successor, successorIdx) => (
                                  <tr
                                    key={successorIdx}
                                    className={
                                      successorIdx % 2 === 0
                                        ? undefined
                                        : "bg-gray-50"
                                    }
                                  >
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                      {successorIdx + 1}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-black">
                                      {successor.predecessor_name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {successor.predecessor_task_name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {successor.predecessor_task_end_date
                                        ? format(
                                            new Date(
                                              successor.predecessor_task_end_date
                                            ),
                                            "MM/dd/yyyy"
                                          )
                                        : "..."}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-black">
                                      {successor.succ_proj_name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {successor.successor_task_name}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                      {successor.successor_task_start_date
                                        ? format(
                                            new Date(
                                              successor.predecessor_task_end_date
                                            ),
                                            "MM/dd/yyyy"
                                          )
                                        : "..."}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Dependencies Modal */}
      <ModalEditProjectDependencies
        project={project}
        predecessors={predecessors}
        successors={successors}
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
      />
    </div>
  );
}

export default ProjectDependencies;
