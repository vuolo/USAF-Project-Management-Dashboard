import { Chart } from "react-google-charts";

import { api } from "~/utils/api";
import { formatCurrency } from "~/utils/currency";

function FinancialSummary() {
  const { data: obligation } = api.obligation.getTotalObligation.useQuery({});
  const { data: expenditure } = api.expenditure.getTotalExpenditure.useQuery(
    {}
  );
  const { data: breakpoints } = api.financial_summary.getBreakpoints.useQuery();

  return (
    <div className="rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary</h1>
      </div>

      <div className="flex h-[27.35rem] justify-evenly gap-6 px-8 pt-4 pb-6">
        {obligation && expenditure && breakpoints ? (
          <>
            {/* Obligation Status to Date */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium underline">
                Obligation Status to Date
              </h3>

              {obligation.obli_actual / obligation.obli_projected > 2 ? (
                <h4 className="py-8 text-sm italic">
                  This chart cannot be displayed.
                </h4>
              ) : (
                <Chart
                  chartType="PieChart"
                  data={dataPie(
                    obligation.obli_actual,
                    obligation.obli_projected
                  )}
                  options={expendOptionsPie(
                    obligation.obli_actual,
                    obligation.obli_projected,
                    breakpoints.obli_red_breakpoint,
                    breakpoints.obli_yellow_breakpoint
                  )}
                />
              )}

              {/* Summary */}
              <div>
                <h2>Obligation %:</h2>
                <h2 className="font-bold">
                  {!obligation.obli_actual || !obligation.obli_projected
                    ? "N/A"
                    : `${(
                        (obligation.obli_actual / obligation.obli_projected) *
                        100
                      ).toFixed(2)}%`}
                </h2>
                <p className="text-sm">
                  Actual Obligation:{" "}
                  <b>
                    {obligation.obli_actual
                      ? formatCurrency(obligation.obli_actual)
                      : "N/A"}
                  </b>
                </p>
                <p className="text-sm">
                  Planned Obligation:{" "}
                  <b>
                    {obligation.obli_projected
                      ? formatCurrency(obligation.obli_projected)
                      : "N/A"}
                  </b>
                </p>
              </div>
            </div>

            {/* Expenditure Status to Date */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium underline">
                Expenditure Status to Date
              </h3>

              {expenditure.expen_actual / expenditure.expen_projected > 2 ? (
                <h4 className="py-8 text-sm italic">
                  This chart cannot be displayed.
                </h4>
              ) : (
                <Chart
                  chartType="PieChart"
                  data={dataPie(
                    expenditure.expen_actual,
                    expenditure.expen_projected
                  )}
                  options={expendOptionsPie(
                    expenditure.expen_actual,
                    expenditure.expen_projected,
                    breakpoints.expen_red_breakpoint,
                    breakpoints.expen_yellow_breakpoint
                  )}
                />
              )}

              {/* Summary */}
              <div>
                <h2>Expenditure %:</h2>
                <h2 className="font-bold">
                  {!expenditure.expen_actual || !expenditure.expen_projected
                    ? "N/A"
                    : `${(
                        (expenditure.expen_actual /
                          expenditure.expen_projected) *
                        100
                      ).toFixed(2)}%`}
                </h2>
                <p className="text-sm">
                  Actual Expenditure:{" "}
                  <b>
                    {expenditure.expen_actual
                      ? formatCurrency(expenditure.expen_actual)
                      : "N/A"}
                  </b>
                </p>
                <p className="text-sm">
                  Planned Expenditure:{" "}
                  <b>
                    {expenditure.expen_projected
                      ? formatCurrency(expenditure.expen_projected)
                      : "N/A"}
                  </b>
                </p>
              </div>
            </div>
          </>
        ) : (
          <h3 className="py-8 text-sm italic">Loading...</h3>
        )}
      </div>
    </div>
  );
}

export default FinancialSummary;

const dataPie = (actual: number, planned: number) => {
  const unspent = planned - actual;
  return [
    ["funding", "amount"],
    ["Actual", actual],
    ["difference", unspent < 0 ? 0 : unspent],
    ["Buffer", actual > planned ? planned - (actual - planned) : planned],
  ];
};

const getPieColor = (
  actual: number,
  planned: number,
  rCoefficent: number,
  yCoefficent: number
) => {
  if (actual / planned > 2) return "black";
  const red_coefficent = rCoefficent / 100;
  const yellow_coefficent = yCoefficent / 100;
  if (
    actual >= planned * (1 + red_coefficent) ||
    actual <= planned * (1 - red_coefficent)
  ) {
    return "red";
  }
  if (
    actual >= planned * (1 + yellow_coefficent) ||
    actual <= planned * (1 - yellow_coefficent)
  ) {
    return "yellow";
  }
  return "green";
};

const expendOptionsPie = (
  actual: number,
  planned: number,
  rCoefficent: number,
  yCoefficent: number
) => {
  const color = getPieColor(actual, planned, rCoefficent, yCoefficent);
  return {
    tooltip: { text: "value" },
    chartArea: { left: "5%", top: "5%   ", width: "90%", height: "90%" },
    backgroundColor: "white",
    pieSliceBorderColor: "transparent",
    pieSliceText: "label",
    pieSliceTextStyle: { fontSize: 15 },
    legend: "none",
    pieHole: 0.3,
    pieStartAngle: -90,
    is3D: false,
    slices: {
      0: { color: { color } },
      1: { color: "grey" },
      2: { color: "transparent", textStyle: { color: "transparent" } },
    },
  };
};
