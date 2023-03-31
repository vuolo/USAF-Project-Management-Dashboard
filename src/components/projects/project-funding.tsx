/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { api } from "~/utils/api";

import BarGraph from "~/components/graphs/bar-graph";
import LineGraph from "~/components/graphs/line-graph";

import type { view_project } from "~/types/view_project";
import { formatCurrency } from "~/utils/currency";
import TableApprovedFunding from "./tables/table-approved-funding";
import TableObligationPlan from "./tables/table-obligation-plan";
import TableExpenditurePlan from "./tables/table-expenditure-plan";
import ModalEditProjectFunding from "./modals/modal-edit-project-funding";

function ProjectFunding({ project }: { project: view_project }) {
  const user = useSession().data?.db_user;
  const { data: obligationPlan } = api.obligation.getObligationPlan.useQuery({
    project_id: project.id,
  });
  const { data: expenditurePlan } = api.expenditure.getExpenditurePlan.useQuery(
    {
      project_id: project.id,
    }
  );
  const { data: approvedFunding } = api.approved.getApprovedFunding.useQuery({
    project_id: project.id,
  });
  const { data: approvedEstimates } = api.approved.getEstimates.useQuery({
    project_id: project.id,
  });

  const [selectedTab, setSelectedTab] = useState<
    | "obligation_bar"
    | "obligation_line"
    | "expenditure_bar"
    | "expenditure_line"
  >("obligation_bar");

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Funding</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
            >
              Edit
            </button>
          )}
      </div>

      <div className="flex flex-col justify-around gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6 md:flex-row">
        {false ? (
          <p className="text-center italic">This project has no funding yet.</p>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {/* Don't display the graphs on Pre-Award pages (TODO: figure out of this is intended, but that is how the previous group did it...) */}
            {(project.contract_status as string) !== "Pre-Award" &&
              // Make sure the data is loaded before displaying the graphs
              obligationPlan &&
              expenditurePlan && (
                // Graphs visualizing the funding:
                <>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                        selectedTab === "obligation_bar"
                          ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                          : "cursor-pointer bg-brand-dark"
                      }`}
                      onClick={() => {
                        setSelectedTab("obligation_bar");
                      }}
                    >
                      Obligation Bar Chart
                    </button>
                    <button
                      className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                        selectedTab === "obligation_line"
                          ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                          : "cursor-pointer bg-brand-dark"
                      }`}
                      onClick={() => {
                        setSelectedTab("obligation_line");
                      }}
                    >
                      Obligation Line Chart
                    </button>
                    <button
                      className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                        selectedTab === "expenditure_bar"
                          ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                          : "cursor-pointer bg-brand-dark"
                      }`}
                      onClick={() => {
                        setSelectedTab("expenditure_bar");
                      }}
                    >
                      Expenditure Bar Chart
                    </button>
                    <button
                      className={`rounded-md px-4 py-2 text-white hover:bg-brand-dark/80 ${
                        selectedTab === "expenditure_line"
                          ? "cursor-not-allowed bg-brand-dark/80 ring-2 ring-yellow-500"
                          : "cursor-pointer bg-brand-dark"
                      }`}
                      onClick={() => {
                        setSelectedTab("expenditure_line");
                      }}
                    >
                      Expenditure Line Chart
                    </button>
                  </div>

                  {/* Projected Obligation Bar Chart */}
                  {selectedTab === "obligation_bar" && (
                    <BarGraph
                      data={formatDataForCharts(obligationPlan)}
                      dataKey1="Projected"
                      dataKey2="Actual"
                    />
                  )}

                  {/* Projected Obligation Line Chart */}
                  {selectedTab === "obligation_line" && (
                    <LineGraph
                      data={formatDataForCharts(obligationPlan)}
                      dataKey1="Projected Total"
                      dataKey2="Actual Total"
                    />
                  )}

                  {/* Projected Expenditure Bar Chart */}
                  {selectedTab === "expenditure_bar" && (
                    <BarGraph
                      data={formatDataForCharts(expenditurePlan)}
                      dataKey1="Projected"
                      dataKey2="Actual"
                    />
                  )}

                  {/* Projected Expenditure Line Chart */}
                  {selectedTab === "expenditure_line" && (
                    <LineGraph
                      data={formatDataForCharts(expenditurePlan)}
                      dataKey1="Projected Total"
                      dataKey2="Actual Total"
                    />
                  )}
                </>
              )}

            {/* Independent Cost Estimate & Projected Contract Value */}
            <div className="flex justify-around">
              <div className="text-center">
                <h2 className="font-medium">Independent Cost Estimate:</h2>
                <h1 className="font-3xl mt-2 font-bold">
                  {approvedEstimates ? (
                    formatCurrency(approvedEstimates.ind_gov_est)
                  ) : (
                    <span className="italic">N/A</span>
                  )}
                </h1>
              </div>
              <div className="text-center">
                <h2 className="font-medium">Projected Contract Value:</h2>
                <h1 className="font-3xl mt-2 font-bold">
                  {approvedEstimates ? (
                    formatCurrency(approvedEstimates.contract_value)
                  ) : (
                    <span className="italic">N/A</span>
                  )}
                </h1>
              </div>
            </div>

            {/* Tables that visualize the funding: */}
            <TableApprovedFunding approvedFunding={approvedFunding} />
            <TableObligationPlan
              project={project}
              obligationPlan={obligationPlan}
            />
            {(project.contract_status as string) !== "Pre-Award" && (
              <TableExpenditurePlan expenditurePlan={expenditurePlan} />
            )}
          </div>
        )}
      </div>

      {/* Edit Funding Modal */}
      <ModalEditProjectFunding
        project={project}
        obligationPlan={obligationPlan}
        expenditurePlan={expenditurePlan}
        approvedFunding={approvedFunding}
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
      />
    </div>
  );
}

export default ProjectFunding;

function formatDataForCharts(data: any[]): any[] {
  const retVal: any[] = [];
  let temp: any = {};

  data.forEach((info) => {
    temp.id = info.id;
    temp.Actual = Number(info.Actual);
    temp["Actual Total"] = Number(info["Actual Total"]);
    temp.Projected = Number(info.Projected);
    temp["Projected Total"] = Number(info["Projected Total"]);
    temp.date = format(new Date(info.date), "MM/dd/yyyy");
    retVal.push(temp);
    temp = {};
  });

  return retVal;
}
