import Link from "next/link";
import { useSession } from "next-auth/react";
import StatusIcon from "./icons/status-icon";
import {Star} from "lucide-react";

import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";
import { useState } from "react";
import { classNames } from "~/utils/misc";

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

function ProjectsOverview() {
  const user = useSession().data?.db_user;
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("project_name");
  const { data: branches } = api.branch.getAll.useQuery();

  const { data: projects, refetch } = api.project.search.useQuery({
    filterQuery,
    filterType,
  });

  function convertBranches() {
    if (!branches) return null;
    return branches.map((branch) => (
      <option key={branch.id} value={branch.branch_name}>
        {branch.branch_name}
      </option>
    ));
  }

  const [isHighlighted, setHighlighted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseEnter = () => {
    setHighlighted(true);
  };
  const handleMouseLeave = () => {
    if(!isClicked)
      setHighlighted(false);
  };

  const handleClick = () => {
    setHighlighted(isHighlighted);
    setIsClicked(!isClicked)
  };
  // const starColor = isHighlighted ? 'yellow' : '';

    
  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-100">Projects</h1>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/add-project"
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark/80 focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add Project
          </Link>
        </div>
      </div>

      {/*Search*/}
      <div className="mt-4 flex w-fit gap-2 px-2">
        {filterType === "dependency_status" ||
        filterType === "schedule_status" ? (
          // Icon Dropdown search
          <select
            id="filter-select"
            name="filter-select"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              void refetch();
            }}
          >
            <option value="">No Filter</option>
            <option value="ONTRACK">On-Track</option>
            <option value="BEHIND">Behind</option>
            <option value="REALLY-BEHIND">Really-Behind</option>
          </select>
        ) : filterType === "financial_status" ? (
          <select
            id="filter-select"
            name="filter-select"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              void refetch();
            }}
          >
            <option value="">No Filter</option>
            <option value="ON-BUDGET">ON-BUDGET</option>
            <option value="UNDERBUDGET">UNDERBUDGET</option>
            <option value="OVERBUDGET">OVERBUDGET</option>
            <option value="REALLY-UNDERBUDGET">REALLY-UNDERBUDGET</option>
            <option value="REALLY-OVERBUDGET">REALLY-OVERBUDGET</option>
          </select>
        ) : // Contract Status Dropdown search
        filterType === "contract_status" ? (
          <select
            id="filter-select"
            name="filter-select"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              void refetch();
            }}
          >
            <option value="">No Filter</option>
            <option value="Closed">Closed</option>
            <option value="Awarded">Awarded</option>
            <option value="Pre-Award">Pre-Award</option>
          </select>
        ) : // Branch dropdown search
        filterType === "branch" ? (
          <select
            id="filter-select"
            name="filter-select"
            className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
            value={filterQuery}
            onChange={(e) => {
              setFilterQuery(e.target.value);
              void refetch();
            }}
          >
            <option value="">No Filter</option>
            {convertBranches()}
          </select>
        ) : (
          // Text search
          <input
            type="text"
            name="filter-text"
            id="filter-text"
            className="block w-full flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:min-w-full sm:text-sm"
            placeholder="Search..."
            onChange={(e) => {
              setFilterQuery(e.target.value);
              void refetch();
            }}
          />
        )}

        {/*Search Field Dropdown*/}
        <select
          id="filter-select"
          name="filter-select"
          className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
          value={filterType}
          onChange={(e) => {
            setFilterQuery("");
            setFilterType(e.target.value as FilterType);
          }}
        >
          <option value="project_name">Project Name</option>
          <option value="contract_number">Contract Number</option>
          <option value="contract_status">Contract Status</option>
          <option value="contract_value">Contract Value</option>
          <option value="branch">Organization/Branch</option>
          <option value="dependency_status">Dependency Status</option>
          <option value="financial_status">Financial Status</option>
          <option value="schedule_status">Schedule Status</option>
          {user?.user_role !== "Contractor" ? (
            <option value="contractor">Contractor</option>
          ) : (
            <></>
          )}
        </select>
      </div>

      {/*Projects Table*/}
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!projects ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : projects.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No projects to display.
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th></th>
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
                        Contract Number
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Contract Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Organization/Branch
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Contract Value ($)
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Dependency Status
                      </th>
                      {user?.user_role !== "Contractor" && (
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Financial Status
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Schedule Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {projects &&
                      projects.map((project, projectIdx) => (
                        <tr
                          key={project.id}
                          className={classNames(
                            projectIdx % 2 === 0 ? "" : "bg-gray-50",
                            `project-${project.id}`
                          )}
                        >
                          <td className="pl-5 pr-0 cursor-pointer" onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <Star size={20} style={{fill:`${isHighlighted ? 'yellow' : ''}`}}/>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-brand-dark underline sm:pl-6">
                            <Link
                              href={`/projects/${project.id}`}
                              className="hover:text-brand-dark/80"
                            >
                              {project.project_name || "Untitled"}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.contract_num || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.contract_status || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {project.branch || "..."}
                          </td>
                          {user?.user_role !== "Contractor" && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatCurrency(project.contract_value)}
                            </td>
                          )}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectsOverview;
