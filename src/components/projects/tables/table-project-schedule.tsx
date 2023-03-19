import { format } from "date-fns";
import type { milestone } from "~/types/milestone";
import { isInvalidDate } from "~/utils/date";

type TableProps = {
  milestoneSchedules?: milestone[];
};

function TableProjectSchedule({ milestoneSchedules }: TableProps) {
  return (
    <div className="mt-2 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            {!milestoneSchedules ? (
              <div className="flex h-64 items-center justify-center">
                <div className="italic text-gray-500">Loading...</div>
              </div>
            ) : milestoneSchedules.length === 0 ? (
              <div className="flex h-64 items-center justify-center px-8">
                <div className="text-center italic text-gray-500">
                  There is no milestone schedule data available for this
                  project.
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
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Projected Start
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Projected End
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Actual Start
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Actual End
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Predecessors
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {milestoneSchedules &&
                    milestoneSchedules.map((milestoneSchedule, schIdx) => (
                      <tr
                        key={milestoneSchedule.ID}
                        className={schIdx % 2 === 0 ? undefined : "bg-gray-50"}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                          {milestoneSchedule.Name || "..."}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {!isInvalidDate(milestoneSchedule.ProjectedStart)
                            ? format(
                                new Date(
                                  milestoneSchedule.ProjectedStart || ""
                                ),
                                "MM/dd/yyyy"
                              )
                            : "..."}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {!isInvalidDate(milestoneSchedule.ProjectedEnd)
                            ? format(
                                new Date(milestoneSchedule.ProjectedEnd || ""),
                                "MM/dd/yyyy"
                              )
                            : "..."}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {!isInvalidDate(milestoneSchedule.ActualStart)
                            ? format(
                                new Date(milestoneSchedule.ActualStart || ""),
                                "MM/dd/yyyy"
                              )
                            : "..."}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {!isInvalidDate(milestoneSchedule.ActualEnd)
                            ? format(
                                new Date(milestoneSchedule.ActualEnd || ""),
                                "MM/dd/yyyy"
                              )
                            : "..."}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {milestoneSchedule.Predecessors_Name || "..."}
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
  );
}

export default TableProjectSchedule;
