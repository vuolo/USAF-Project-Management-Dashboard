import { useState } from "react";
import { AlertTriangle, Filter } from "lucide-react";
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
    <div className="overflow-hidden rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary</h1>
      </div>

      <div className="flex h-fit flex-col justify-between gap-6 px-8 pt-4 pb-6">
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
                  obligation.obli_actual <= obligation.obli_projected &&
                  obligation.obli_actual >= 0 &&
                  obligation.obli_projected >= 0 ? (
                    <DonutChart
                      actualToDate={obligation.obli_actual}
                      projectedToDate={obligation.obli_projected}
                      projectedTotal={obligation.obli_projected_total}
                      redBreakpoint={breakpoints.obli_red_breakpoint}
                      yellowBreakpoint={breakpoints.obli_yellow_breakpoint}
                      type="obligation"
                    />
                  ) : (
                    // Display Error Message
                    <div className="mx-auto mt-2 mb-4 flex h-[14rem] w-[14rem] items-center justify-center gap-2 rounded-full border-[30px] border-gray-300 bg-transparent text-center text-sm font-bold">
                      <div
                        style={{
                          backgroundColor: lightenHexColor("#ff0000", 92.5),
                        }}
                        className={`flex flex-col items-center justify-center rounded-md p-2`}
                      >
                        <AlertTriangle className="text-[red]" />
                        <h3>WARNING</h3>
                        <h3 className="font-medium">
                          {obligation.obli_actual > obligation.obli_projected
                            ? "Actual Obligation (to Date) is greater than Projected Obligation (to Date)"
                            : "Actual Obligation (to Date) or Projected Obligation (to Date) is less than 0"}
                        </h3>
                      </div>
                    </div>
                  )
                ) : (
                  // Loading Skeleton
                  <div className="mx-auto mt-2 mb-4 h-[14rem] w-[14rem] animate-pulse rounded-full border-[30px] border-gray-300 bg-transparent" />
                )}

                {/* Key */}
                <div className="mt-2 flex w-full flex-col gap-4 px-2">
                  {/* Actual (to Date) Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        style={{
                          backgroundColor: getPieColor(
                            obligation.obli_actual,
                            obligation.obli_projected,
                            breakpoints.obli_red_breakpoint,
                            breakpoints.obli_yellow_breakpoint
                          ),
                        }}
                        className={`h-3 w-3 rounded-sm ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Actual (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(obligation.obli_actual)}
                    </h3>
                  </div>

                  {/* Remaining (to Date) Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        style={{
                          backgroundColor: lightenHexColor(
                            getPieColor(
                              obligation.obli_actual,
                              obligation.obli_projected,
                              breakpoints.obli_red_breakpoint,
                              breakpoints.obli_yellow_breakpoint
                            ),
                            85
                          ),
                        }}
                        className={`h-3 w-3 rounded-sm ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Remaining (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(
                        obligation.obli_projected - obligation.obli_actual
                      )}
                    </h3>
                  </div>

                  {/* Projected (to Date) Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-brand-dark ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(obligation.obli_projected)}
                    </h3>
                  </div>

                  {/* Remaining (Total) Obligation */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-[#1C1C1C] ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected (Total)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(obligation.obli_projected_total)}
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
                  expenditure.expen_actual <= expenditure.expen_projected &&
                  expenditure.expen_actual >= 0 &&
                  expenditure.expen_projected >= 0 ? (
                    <DonutChart
                      actualToDate={expenditure.expen_actual}
                      projectedToDate={expenditure.expen_projected}
                      projectedTotal={expenditure.expen_projected_total}
                      redBreakpoint={breakpoints.expen_red_breakpoint}
                      yellowBreakpoint={breakpoints.expen_yellow_breakpoint}
                      type="expenditure"
                    />
                  ) : (
                    // Display Error Message
                    <div className="mx-auto mt-2 mb-4 flex h-[14rem] w-[14rem] items-center justify-center gap-2 rounded-full border-[30px] border-gray-300 bg-transparent text-center text-sm font-bold">
                      <div
                        style={{
                          backgroundColor: lightenHexColor("#ff0000", 92.5),
                        }}
                        className={`flex flex-col items-center justify-center rounded-md p-2`}
                      >
                        <AlertTriangle className="text-[red]" />
                        <h3>WARNING</h3>
                        <h3 className="font-medium">
                          {expenditure.expen_actual >
                          expenditure.expen_projected
                            ? "Actual Expenditure (to Date) is greater than Projected Expenditure (to Date)"
                            : "Actual Expenditure (to Date) or Projected Expenditure (to Date) is less than 0"}
                        </h3>
                      </div>
                    </div>
                  )
                ) : (
                  // Loading Skeleton
                  <div className="mx-auto mt-2 mb-4 h-[14rem] w-[14rem] animate-pulse rounded-full border-[30px] border-gray-300 bg-transparent" />
                )}

                {/* Key */}
                <div className="mt-2 flex w-full flex-col gap-4 px-2">
                  {/* Actual (to Date) Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        style={{
                          backgroundColor: getPieColor(
                            expenditure.expen_actual,
                            expenditure.expen_projected,
                            breakpoints.expen_red_breakpoint,
                            breakpoints.expen_yellow_breakpoint
                          ),
                        }}
                        className={`h-3 w-3 rounded-sm ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Actual (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(expenditure.expen_actual)}
                    </h3>
                  </div>

                  {/* Remaining (to Date) Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-3 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div
                        style={{
                          backgroundColor: lightenHexColor(
                            getPieColor(
                              expenditure.expen_actual,
                              expenditure.expen_projected,
                              breakpoints.expen_red_breakpoint,
                              breakpoints.expen_yellow_breakpoint
                            ),
                            85
                          ),
                        }}
                        className={`h-3 w-3 rounded-sm ring-1 ring-gray-500`}
                      />
                      <h3 className="text-sm">Remaining (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(
                        expenditure.expen_projected - expenditure.expen_actual
                      )}
                    </h3>
                  </div>

                  {/* Projected (to Date) Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-brand-dark ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected (to Date)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(expenditure.expen_projected)}
                    </h3>
                  </div>

                  {/* Projected (Total) Expenditure */}
                  <div className="flex w-full items-center justify-evenly gap-4 xl:justify-between">
                    <div className="flex items-center gap-2 whitespace-nowrap text-left">
                      <div className="h-3 w-3 rounded-sm bg-[#1C1C1C] ring-1 ring-gray-500" />
                      <h3 className="text-sm">Projected (Total)</h3>
                    </div>
                    <h3 className="text-sm font-bold">
                      {formatCurrency(expenditure.expen_projected_total)}
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
        <div className="mb-6 flex flex-col items-center justify-center gap-2 px-4 xl:flex-row">
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

type DonutChartProps = {
  actualToDate: number;
  projectedToDate: number;
  projectedTotal: number;
  redBreakpoint: number;
  yellowBreakpoint: number;
  type: "obligation" | "expenditure";
};

const DonutChart = ({
  actualToDate,
  projectedToDate,
  projectedTotal,
  redBreakpoint,
  yellowBreakpoint,
  type,
}: DonutChartProps) => {
  const innerRingData = [
    ["Label", "Value", { role: "tooltip", type: "string", p: { html: true } }],
    [
      "Actual (to Date)",
      actualToDate,
      styledTooltip(
        "Actual (to Date)",
        actualToDate,
        actualToDate / projectedToDate,
        true
      ),
    ],
    [
      "Remaining (to Date)",
      projectedToDate - actualToDate,
      styledTooltip(
        "Remaining (to Date)",
        projectedToDate - actualToDate,
        1 - actualToDate / projectedToDate,
        true
      ),
    ],
  ];

  const innerRingColor = getPieColor(
    actualToDate,
    projectedToDate,
    redBreakpoint,
    yellowBreakpoint
  );

  const innerRingOptions: ReactGoogleChartProps["options"] = {
    pieHole: 0.8,
    pieSliceTextStyle: {
      color: "transparent",
    },
    pieSliceBorderColor: "#1C1C1C",
    pieStartAngle: -90,
    legend: "none",
    backgroundColor: "transparent",
    colors: [innerRingColor, lightenHexColor(innerRingColor, 85)],
    pieSliceText: "none",
    tooltip: { trigger: "visible", isHtml: true },
    chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
    enableInteractivity: true,
  };

  const outerRingData = [
    ["Label", "Value", { role: "tooltip", type: "string", p: { html: true } }],
    [
      "Projected (Total)",
      projectedTotal,
      styledTooltip(
        "Projected (Total)",
        projectedTotal,
        projectedToDate / projectedTotal
      ),
    ],
    [
      "Projected (to Date)",
      projectedToDate,
      styledTooltip(
        "Projected (to Date)",
        projectedToDate,
        1 - projectedToDate / projectedTotal
      ),
    ],
  ];

  const outerRingOptions: ReactGoogleChartProps["options"] = {
    pieHole: 0.8,
    pieSliceTextStyle: {
      color: "transparent",
    },
    pieSliceBorderColor: "transparent",
    pieStartAngle: -90,
    legend: "none",
    backgroundColor: "transparent",
    colors: ["#0033a0", "#1C1C1C"],
    pieSliceText: "none",
    tooltip: { trigger: "visible", isHtml: true },
    chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
    enableInteractivity: true,
  };

  return (
    <div className="relative h-80 overflow-visible">
      {/* Outer Ring */}
      <Chart
        className="absolute top-0 left-0 z-[2] h-full w-full overflow-visible rounded-full"
        chartType="PieChart"
        width="100%"
        height="100%"
        data={outerRingData}
        options={outerRingOptions}
      />

      {/* Inner Ring */}
      <Chart
        className="absolute top-0 left-0 z-[3] scale-[85%] overflow-visible rounded-full"
        chartType="PieChart"
        width="100%"
        height="100%"
        data={innerRingData}
        options={innerRingOptions}
      />

      <div className="absolute top-1/2 left-1/2 z-[1] mx-auto -translate-x-1/2 -translate-y-1/2 transform text-center">
        <h2 className="text-2xl font-bold">
          {/* format (projected - actual) like the example: ~$13.1K */}
          {formatNumber(projectedToDate - actualToDate)}
        </h2>
        <h3 className="whitespace-nowrap text-[0.95rem] text-gray-700">
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

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function styledTooltip(
  title: string,
  currencyValue: number,
  percentageValue: number,
  scale = false
) {
  return `<p style="${
    scale
      ? "margin: 12px 10px; transform: scale(1.35) !important;"
      : "margin: 3px 0px;"
  }">
            <b>${title}</b>
            <br>
            <span>${formatCurrency(currencyValue)}</span>
            <span>(${formatPercentage(percentageValue)})</span>
          </p>`;
}

type HexColor = string;

function lightenHexColor(hex: HexColor, percentage = 50): HexColor {
  const validateHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (!validateHexColor.test(hex)) throw new Error("Invalid hex color format.");

  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r += Math.round((255 - r) * (percentage / 100));
  g += Math.round((255 - g) * (percentage / 100));
  b += Math.round((255 - b) * (percentage / 100));

  const newHexColor = `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

  return newHexColor;
}

const getPieColor = (
  actual: number,
  projected: number,
  redBreakpoint: number,
  yellowBreakpoint: number
) => {
  if (actual > projected) return "#000000";

  if (
    actual >= projected * (1 + redBreakpoint / 100) ||
    actual <= projected * (1 - redBreakpoint / 100)
  )
    return "#ff0000";

  if (
    actual >= projected * (1 + yellowBreakpoint / 100) ||
    actual <= projected * (1 - yellowBreakpoint / 100)
  )
    return "#ffff00";

  return "#008000";
};
