import { useState } from "react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import NavBar from "~/components/nav-bar";
import AdminFinancialSummaryBreakpoints from "~/components/admin/admin-financial-summary-breakpoints";
import AdminContractAwardDays from "~/components/admin/admin-contract-award-days";
import AdminContractors from "~/components/admin/admin-contractors";
import AdminFundingTypes from "~/components/admin/admin-funding-types";
import AdminOrganizationsBranches from "~/components/admin/admin-organizations-branches";
import AdminMilitaryJobTitles from "~/components/admin/admin-military-job-titles";
import AdminProjects from "~/components/admin/admin-projects";
import AdminUsers from "~/components/admin/admin-users";
import AdminListUsers from "~/components/admin/admin-list-users";

const Admin: NextPage = () => {
  const user = useSession().data?.db_user;
  const [selectedOption, setSelectedOption] = useState(
    "financial-summary-breakpoints"
  );

  return (
    <main>
      {/* Top Section */}
      <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:flex-row sm:justify-around sm:pt-6">
        {user?.user_role === "Admin" ? (
          <>
            {/* Sidebar (Top Bar on Mobile) */}
            <div className="flex flex-col gap-2 sm:w-[33%]">
              <h1 className="mb-4 mt-2 text-center text-xl font-medium sm:mt-0">
                Admin Settings
              </h1>
              <p
                onClick={() =>
                  setSelectedOption("financial-summary-breakpoints")
                }
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "financial-summary-breakpoints"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Financial Summary Breakpoints
              </p>
              <p
                onClick={() => setSelectedOption("contract-award-days")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "contract-award-days"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Contract Award Days
              </p>
              <p
                onClick={() => setSelectedOption("contractors")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "contractors"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Contractors
              </p>
              <p
                onClick={() => setSelectedOption("funding-types")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "funding-types"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Funding Types
              </p>
              <p
                onClick={() => setSelectedOption("organizations-branches")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "organizations-branches"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Organizations/Branches
              </p>
              <p
                onClick={() => setSelectedOption("military-job-titles")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "military-job-titles"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Military Job Titles
              </p>
              <p
                onClick={() => setSelectedOption("users")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "users"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Users
              </p>
              <p
                onClick={() => setSelectedOption("listusers")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "users"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                List Users
              </p>
              <p
                onClick={() => setSelectedOption("projects")}
                className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                  selectedOption === "projects"
                    ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                    : "cursor-pointer bg-brand-dark"
                }`}
              >
                Projects
              </p>
            </div>

            {/* Settings Details */}
            <div className="flex flex-col gap-6 sm:w-[67%]">
              {renderSettingsDetails(selectedOption)}
            </div>
          </>
        ) : (
          <div className="mt-[5vh] flex flex-col gap-6 sm:w-[67%]">
            <h1 className="mb-4 mt-2 text-center text-xl font-medium sm:mt-0">
              You are not authorized to view this page.
            </h1>
          </div>
        )}
      </div>
    </main>
  );
};

export default Admin;

const renderSettingsDetails = (selectedOption: string) => {
  switch (selectedOption) {
    case "financial-summary-breakpoints":
      return <AdminFinancialSummaryBreakpoints />;
    case "contract-award-days":
      return <AdminContractAwardDays />;
    case "contractors":
      return <AdminContractors />;
    case "funding-types":
      return <AdminFundingTypes />;
    case "organizations-branches":
      return <AdminOrganizationsBranches />;
    case "military-job-titles":
      return <AdminMilitaryJobTitles />;
    case "users":
      return <AdminUsers />;
    case "listusers":
      return <AdminListUsers />
    case "projects":
      return <AdminProjects />;
    default:
      <AdminFinancialSummaryBreakpoints />;
  }
};
