import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";
import { format } from "date-fns";

function ProjectClinWBS({
  project_id,
  clin_num,
}: {
  project_id: number;
  clin_num: number;
}) {
  const user = useSession().data?.db_user;
  const { data: wbs_list } = api.wbs.get.useQuery({ project_id, clin_num });

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-100 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            WBS
          </h1>
          <p className="mt-2 text-sm text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
            View the WBS (Work Breakdown Structure) data for this CLIN.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!wbs_list ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : wbs_list.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                    No WBS data for this CLIN.
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
                        Task ID
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Task Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Month
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        CLIN
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Source Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Resource
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Resource Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Resource Type
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Rate
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Hours
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Units
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Cost
                        </th>
                      )}
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Base Cost
                        </th>
                      )}
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Direct Cost
                        </th>
                      )}
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Total Price
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {wbs_list &&
                      wbs_list.map((wbs, wbsIdx) => (
                        <tr
                          key={wbs.id}
                          className={
                            wbsIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                            {wbs.task_id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.task_description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.month
                              ? format(new Date(wbs.month), "MMMM yyyy")
                              : "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.clin_num}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.source_type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.resource_code}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.resource_description}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.resource_type}
                          </td>
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {wbs.rate
                                ? formatCurrency(Number(wbs.rate))
                                : "..."}
                            </td>
                          )}
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.hours_worked}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {wbs.units ? Number(wbs.units) : "..."}
                          </td>
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {wbs.cost
                                ? formatCurrency(Number(wbs.cost))
                                : "..."}
                            </td>
                          )}
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {wbs.base_cost
                                ? formatCurrency(Number(wbs.base_cost))
                                : "..."}
                            </td>
                          )}
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {wbs.direct_cost
                                ? formatCurrency(Number(wbs.direct_cost))
                                : "..."}
                            </td>
                          )}
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {wbs.total_price
                                ? formatCurrency(Number(wbs.total_price))
                                : "..."}
                            </td>
                          )}
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

export default ProjectClinWBS;
