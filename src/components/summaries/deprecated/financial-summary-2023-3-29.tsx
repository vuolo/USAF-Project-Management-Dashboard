import { useState } from "react";
import { Filter } from "lucide-react";
import { Chart, type ReactGoogleChartProps } from "react-google-charts";

import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";
import useBreakpointChange from "~/hooks/useBreakpointChange";
import MultiSelectBox from "../../ui/multi-select-box";
import type { view_project } from "~/types/view_project";

function FinancialSummary() {
  const [selectedProjects, setSelectedProjects] = useState<view_project[]>([]);

  const { data: projects } = api.project.list_view.useQuery();
  const { data: obligation } = api.obligation.getTotalObligation.useQuery({
    project_ids: selectedProjects.map((project) => project.id),
  });
  const { data: expenditure } = api.expenditure.getTotalExpenditure.useQuery({
    project_ids: selectedProjects.map((project) => project.id),
  });
  const { data: breakpoints } = api.financial_summary.getBreakpoints.useQuery();

  const [shouldDisplayChart, setShouldDisplayChart] = useState(true);
  const breakpointChanged = (
    newBreakpoint: ReturnType<typeof useBreakpointChange>
  ) => {
    // Make chart display none for a moment so that it can be re-rendered with the new breakpoint
    setShouldDisplayChart(false);
    setTimeout(() => {
      setShouldDisplayChart(true);
    }, 100);
  };

  useBreakpointChange(breakpointChanged);

  return (
    <div className="rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary (to date)</h1>
      </div>

      <div className="flex h-fit flex-col justify-between gap-6 px-8 pt-4 pb-6 xl:h-[27.35rem]">
        {obligation && expenditure && breakpoints ? (
          <>
            <div className="flex h-full flex-col justify-evenly gap-6 xl:flex-row">
              {/* Obligation Status */}
              <div className="flex h-full flex-col bg-[#F7F7F7] px-4 pt-2 pb-4 shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between gap-20">
                  <h2 className="text-md">Obligation Status</h2>
                  <div className="flex items-center justify-center gap-2">
                    {/* Status Icon */}
                    {/* <div
                      className={`h-2.5 w-2.5 rounded-full bg-[${getPieColor(
                        obligation.obli_actual,
                        obligation.obli_projected,
                        breakpoints.obli_red_breakpoint,
                        breakpoints.obli_yellow_breakpoint
                      )}] ring-1 ring-gray-500`}
                    /> */}

                    {/* Percentage of Obligation Fulfilled */}
                    <h3 className="text-sm font-bold">
                      {!obligation.obli_actual || !obligation.obli_projected
                        ? "...%"
                        : `${(
                            (obligation.obli_actual /
                              obligation.obli_projected) *
                            100
                          ).toFixed(2)}%`}
                    </h3>
                  </div>
                </div>

                {/* Donut Chart */}
                {shouldDisplayChart ? (
                  <DonutChart
                    actual={obligation.obli_actual}
                    projected={obligation.obli_projected}
                    redBreakpoint={breakpoints.obli_red_breakpoint}
                    yellowBreakpoint={breakpoints.obli_yellow_breakpoint}
                    type="obligation"
                  />
                ) : (
                  // Loading Skeleton
                  <div className="mx-auto mt-2 mb-4 h-[14rem] w-[14rem] animate-pulse rounded-full border-[30px] border-gray-300 bg-transparent" />
                )}

                {/* Key */}
                <div className="mt-2 flex w-full flex-col gap-4 px-2">
                  {/* Actual Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        className={`h-3 w-3 rounded-sm bg-[${getPieColor(
                          obligation.obli_actual,
                          obligation.obli_projected,
                          breakpoints.obli_red_breakpoint,
                          breakpoints.obli_yellow_breakpoint
                        )}] ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Actual Obligation</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(obligation.obli_actual)}
                    </h3>
                  </div>

                  {/* Projected Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-brand-dark ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected Obligation</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(obligation.obli_projected)}
                    </h3>
                  </div>

                  {/* Remaining Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-[#1C1C1C] ring-1 ring-gray-500" />
                      <h3 className="text-sm">Remaining Obligation</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(
                        obligation.obli_projected - obligation.obli_actual
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Expenditure Status */}
              <div className="flex h-full flex-col bg-[#F7F7F7] px-4 pt-2 pb-4 shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between gap-20">
                  <h2 className="text-md">Expenditure Status</h2>
                  <div className="flex items-center justify-center gap-2">
                    {/* Status Icon */}
                    {/* <div
                      className={`h-2.5 w-2.5 rounded-full bg-[${getPieColor(
                        expenditure.expen_actual,
                        expenditure.expen_projected,
                        breakpoints.expen_red_breakpoint,
                        breakpoints.expen_yellow_breakpoint
                      )}] ring-1 ring-gray-500`}
                    /> */}

                    {/* Percentage of Expenditure Fulfilled */}
                    <h3 className="text-sm font-bold">
                      {!expenditure.expen_actual || !expenditure.expen_projected
                        ? "...%"
                        : `${(
                            (expenditure.expen_actual /
                              expenditure.expen_projected) *
                            100
                          ).toFixed(2)}%`}
                    </h3>
                  </div>
                </div>

                {/* Donut Chart */}
                {shouldDisplayChart ? (
                  <DonutChart
                    actual={expenditure.expen_actual}
                    projected={expenditure.expen_projected}
                    redBreakpoint={breakpoints.expen_red_breakpoint}
                    yellowBreakpoint={breakpoints.expen_yellow_breakpoint}
                    type="expenditure"
                  />
                ) : (
                  // Loading Skeleton
                  <div className="mx-auto mt-2 mb-4 h-[14rem] w-[14rem] animate-pulse rounded-full border-[30px] border-gray-300 bg-transparent" />
                )}

                {/* Key */}
                <div className="mt-2 flex w-full flex-col gap-4 px-2">
                  {/* Actual Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        className={`h-3 w-3 rounded-sm bg-[${getPieColor(
                          expenditure.expen_actual,
                          expenditure.expen_projected,
                          breakpoints.expen_red_breakpoint,
                          breakpoints.expen_yellow_breakpoint
                        )}] ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Actual Expenditure</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(expenditure.expen_actual)}
                    </h3>
                  </div>

                  {/* Projected Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-brand-dark ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected Expenditure</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(expenditure.expen_projected)}
                    </h3>
                  </div>

                  {/* Remaining Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-[#1C1C1C] ring-1 ring-gray-500" />
                      <h3 className="text-sm">Remaining Expenditure</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(
                        expenditure.expen_projected - expenditure.expen_actual
                      )}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <h3 className="py-8 text-sm italic">Loading...</h3>
        )}
      </div>

      {/* Filter (Footer) */}
      {projects && (
        <div className="mb-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <div className="flex items-center justify-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-md mr-2 font-medium">
              Filter Awarded Projects
            </h3>
          </div>
          <MultiSelectBox
            placeholder="Showing All..."
            data={
              // Only show awarded projects (status = 2 (Awarded)))
              projects.filter(
                (project) => project.contract_status === "Awarded"
              )
            }
            displayValue={(project: view_project) => project.project_name}
            displayValues={(projects: view_project[]) =>
              projects.map((p) => p.project_name).join(", ")
            }
            onSelectedItemsChange={(selectedProjects) => {
              setSelectedProjects(selectedProjects);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default FinancialSummary;

const getPieColor = (
  actual: number,
  projected: number,
  rCoefficent: number,
  yCoefficent: number
) => {
  if (actual / projected > 2) return "black";
  const red_coefficent = rCoefficent / 100;
  const yellow_coefficent = yCoefficent / 100;
  if (
    actual >= projected * (1 + red_coefficent) ||
    actual <= projected * (1 - red_coefficent)
  ) {
    return "red";
  }
  if (
    actual >= projected * (1 + yellow_coefficent) ||
    actual <= projected * (1 - yellow_coefficent)
  ) {
    return "yellow";
  }
  return "green";
};

type DonutChartProps = {
  actual: number;
  projected: number;
  redBreakpoint: number;
  yellowBreakpoint: number;
  type: "obligation" | "expenditure";
};

const DonutChart = ({
  actual,
  projected,
  redBreakpoint,
  yellowBreakpoint,
  type,
}: DonutChartProps) => {
  const data = [
    ["Label", "Value"],
    ["Actual", actual],
    ["Remaining", projected - actual],
  ];

  const options: ReactGoogleChartProps["options"] = {
    pieHole: 0.7,
    pieSliceTextStyle: {
      color: "transparent",
    },
    pieSliceBorderColor: "#1C1C1C",
    pieStartAngle: -90,
    legend: "none",
    backgroundColor: "transparent",
    colors: [
      getPieColor(actual, projected, redBreakpoint, yellowBreakpoint),
      "#1C1C1C",
    ],
    pieSliceText: "none",
    tooltip: { trigger: "none" },
    chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
  };

  return (
    <div className="relative h-80 scale-[85%]">
      <Chart
        className="z-10"
        chartType="PieChart"
        width="100%"
        height="100%"
        data={data}
        options={options}
      />
      <svg
        className="absolute top-0 left-0 z-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="50"
          cy="50"
          r="50"
          stroke="#0033a0"
          strokeWidth="5"
          fill="transparent"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 z-20 w-full -translate-x-1/2 -translate-y-1/2 transform text-center">
        <h2 className="text-2xl font-bold">
          {/* format (projected - actual) like the example: ~$13.1K */}
          {formatNumber(projected - actual)}
        </h2>
        <h3 className="text-[0.95rem] text-gray-700">
          Remaining
          {type === "obligation" ? " Obligation" : " Expenditure"}
        </h3>
      </div>
    </div>
  );
};

function formatNumber(number: number) {
  const units = ["", "K", "M", "B", "T"]; // For thousands, millions, billions, trillions
  const unitIndex = Math.floor(Math.log10(number) / 3);
  const value = number / Math.pow(10, unitIndex * 3);
  if (isNaN(value)) return "$0";

  const formattedValue = value.toFixed(1);
  const unit = units[unitIndex];
  const result = `~$${formattedValue}${unit ?? ""}`;

  return result.replace(".0", "");
}
