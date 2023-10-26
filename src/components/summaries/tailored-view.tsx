import Link from "next/link";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { classNames } from "~/utils/misc";
import { useState } from "react";
import StatusIcon from "./icons/status-icon";


function TailoredView() {
  type FilterType =
  | "project_name"
  | "contract_number"
  | "contract_value"
  | "contract_status"
  | "dependency_status"
  | "financial_status"
  | "schedule_status"
  | "branch"
  | "contractor";

    const { data: favorites, refetch } = api.user.getFavorites.useQuery();
    const favoriteId = favorites?.map(x => x.projectId);
    const [filterType, setFilterType] = useState<FilterType>("project_name");
    const { data: projects } = api.project.search.useQuery({
      filterType,
    });    
    const user = useSession().data?.db_user;

    return(
      <div className="flex">
            <div className="w-3/6 rounded-md text-center bg-white shadow-md mx-6 mt-5">
              <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
                <h1>Recently Visited</h1>
              </div>
              <div className="w-full items-center justify-between gap-6 pb-1 sm:min-w-[35rem]">
                Recently visited list
              </div>
            </div>
            <div className="w-3/6 rounded-md bg-white shadow-md mx-6 mt-5">
              <div className="text-center rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
                <h1>Favorites {"("}{favorites?.length}{")"}</h1>
              </div>
              <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="pl-4 py-2 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-5"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="pl-4 py-2 text-left text-sm font-semibold text-gray-900"
                      >
                        Dependency Status
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-4 py-2 text-left text-sm font-semibold text-gray-900"
                        >
                          Financial Status
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-900"
                      >
                        Schedule Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects && projects
                      .filter((project) => favoriteId?.includes(project.id)) // Filter projects based on your condition
                      .map((project, index) => (
                      <tr
                      className={classNames(
                        index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                        )}
                        key={index}
                      >
                        <td className="flex items-start whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-brand-dark underline sm:pl-6">
                          <Link href={`/projects/${project.id}`}>
                            {project.project_name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <StatusIcon status={project.dependency_status} />
                        </td>
                        {user?.user_role !== "Contractor" && (
                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <StatusIcon status={project.financial_status} />
                          </td>
                        )}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <StatusIcon status={project.schedule_status} />
                        </td>
                      </tr>
                    ))}  
                  </tbody>
                </table>        
        </div>
        </div>
    );
}
export default TailoredView;
