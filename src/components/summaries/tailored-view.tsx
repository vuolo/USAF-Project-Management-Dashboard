import Link from "next/link";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { classNames } from "~/utils/misc";
import { useEffect, useState } from "react";
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
  const [filterType, setFilterType] = useState<FilterType>("project_name");
  const { data: projects } = api.project.search.useQuery({
    filterType,
  });
  const user = useSession().data?.db_user;
  const { data: recentProjects } = api.user.getProjectHistory.useQuery();
  // const visitedProject = recentProjects?.map(x => x.id);
  const [recentlyVisited, setRecentlyVisited] = useState<number[]>([]);
  useEffect(() => {
    setRecentlyVisited(recentProjects?.map((x) => x.id) ?? []);
  }, [recentProjects]);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  useEffect(() => {
    setFavoriteIds(favorites?.map((x) => x.projectId) ?? []);
  }, [favorites]);
  const visitedCount = recentProjects?.map(x => x.count);

  return (
    <div className="flex">
      <div className="mx-6 mt-5 w-3/6 rounded-md bg-white text-center shadow-md">
        <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
          <h1>
            Most Frequently Visited {"("}
            {recentProjects?.length}
            {")"}
          </h1>
        </div>
        <div className="w-full items-center justify-between gap-6 pb-1 sm:min-w-[35rem]">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-5"
                >
                  Name
                </th>
              </tr>
            </thead>
            <tbody>
            {recentProjects &&
              recentProjects
                .sort((a, b) => b.count - a.count)
                .map((project, index) => (
                  <tr
                    className={classNames(
                      index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                    )}
                    key={index}
                  >
                    <td className="flex justify-between whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-brand-dark sm:pl-6">
                      <Link className="underline hover:text-brand-dark/80" href={`/projects/${project.id}`}>
                        {project.project_name}
                      </Link>
                      (# Visited: {project.count}) 
                    </td>
                  </tr>
                ))}
              </tbody>  
          </table>   
        </div>
      </div>
      <div className="mx-6 mt-5 w-3/6 rounded-md bg-white shadow-md">
        <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
          <h1>
            Favorites {"("}
            {favorites?.length}
            {")"}
          </h1>
        </div>
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-5"
              >
                Name
              </th>
              <th
                scope="col"
                className="py-2 pl-4 text-left text-sm font-semibold text-gray-900"
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
            {projects &&
              projects
                .filter((project) => favoriteIds?.includes(project.id)) // Filter projects based on your condition
                .map((project, index) => (
                  <tr
                    className={classNames(
                      index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                    )}
                    key={index}
                  >
                    <td className="flex items-start whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-brand-dark underline sm:pl-6">
                      <Link className="hover:text-brand-dark/80" href={`/projects/${project.id}`}>
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
