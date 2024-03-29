import { format } from "date-fns";
import Link from "next/link";
import { api } from "~/utils/api";
import { classNames } from "~/utils/misc";

function DependencyOverview() {
  const { data: all_successors } = api.dependency.getAllSuccessors.useQuery();

  return (
    <>
      <div className="mt-6 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            Dependency Overview
          </h1>
          <p className="mt-2 text-sm text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            An overview of all dependency predeccessors and successors for the
            projects you are assigned to.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!all_successors ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : all_successors.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No dependencies to display.
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
                        Predecessor Project
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Predecessor Milestone
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Predecessor Projected Start Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Predecessor Projected End Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Predecessor Actual Start Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Predecessor Actual End Date
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
                        Successor Milestone
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Successor Projected Start Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Successor Projected End Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Successor Actual Start Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Successor Actual End Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {all_successors &&
                      all_successors.map((successor, successorIdx) => (
                        <tr
                          key={successorIdx}
                          className={classNames(
                            successorIdx % 2 === 0 ? "" : "bg-gray-50",
                            `milestone-${successor.pred_id} milestone-${successor.succ_id}`
                          )}
                        >
                          <td
                            className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6 milestone-${successor.pred_id}`}
                          >
                            <Link
                              href={`/projects/${successor.pred_proj_id}`}
                              className="w-fit text-[#2767C8] underline"
                            >
                              {successor.pred_proj_name || "Untitled"}
                            </Link>
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.pred_id}`}
                          >
                            {successor.pred_name}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.pred_id}`}
                          >
                            {format(
                              new Date(successor.pred_proj_start),
                              "MM/dd/yyyy"
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.pred_id}`}
                          >
                            {format(
                              new Date(successor.pred_proj_end),
                              "MM/dd/yyyy"
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.pred_id}`}
                          >
                            {successor.pred_actual_start
                              ? format(
                                  new Date(successor.pred_actual_start),
                                  "MM/dd/yyyy"
                                )
                              : "..."}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.pred_id}`}
                          >
                            {successor.pred_actual_end
                              ? format(
                                  new Date(successor.pred_actual_end),
                                  "MM/dd/yyyy"
                                )
                              : "..."}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm font-medium text-black milestone-${successor.succ_id}`}
                          >
                            <Link
                              href={`/projects/${successor.succ_proj_id}`}
                              className="w-fit text-[#2767C8] underline"
                            >
                              {successor.succ_proj_name || "Untitled"}
                            </Link>
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.succ_id}`}
                          >
                            {successor.succ_name}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.succ_id}`}
                          >
                            {format(
                              new Date(successor.succ_proj_start),
                              "MM/dd/yyyy"
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.succ_id}`}
                          >
                            {format(
                              new Date(successor.succ_proj_end),
                              "MM/dd/yyyy"
                            )}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.succ_id}`}
                          >
                            {successor.succ_actual_start
                              ? format(
                                  new Date(successor.succ_actual_start),
                                  "MM/dd/yyyy"
                                )
                              : "..."}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 milestone-${successor.succ_id}`}
                          >
                            {successor.succ_actual_end
                              ? format(
                                  new Date(successor.succ_actual_end),
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
    </>
  );
}

export default DependencyOverview;
