import { useState } from "react";
import { Chart } from "react-google-charts";

function FinancialSummary() {
  // Obligation
  const [obligationPlanned, setObligationPlanned] = useState(200);
  const [obligationActual, setObligationActual] = useState(210);
  const [obli_red_coefficent, setObliRedCoefficent] = useState(20);
  const [obli_yellow_coefficent, setObliYellowCoefficent] = useState(10);

  // Expenditure
  const [expenditurePlanned, setExpenditurePlanned] = useState(100);
  const [expenditureActual, setExpenditureActual] = useState(80);
  const [expen_red_coefficent, setExpenRedCoefficent] = useState(20);
  const [expen_yellow_coefficent, setExpenYellowCoefficent] = useState(10);

  return (
    <div className="rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary</h1>
      </div>

      <div className="flex h-[26.5rem] justify-evenly gap-6 px-8 pt-4 pb-6">
        {/* Obligation Status to Date */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium underline">
            Obligation Status to Date
          </h3>

          <Chart
            chartType="PieChart"
            data={dataPie(obligationActual, obligationPlanned)}
            options={expendOptionsPie(
              obligationActual,
              obligationPlanned,
              obli_red_coefficent,
              obli_yellow_coefficent
            )}
          />

          {/* Summary */}
          <div>
            <h2>Obligation %:</h2>
            <h2 className="font-bold">
              {((obligationActual / obligationPlanned) * 100).toFixed(2)}%
            </h2>
            <p className="text-sm">
              Actual Obligation: <b>{obligationActual}</b>
            </p>
            <p className="text-sm">
              Planned Obligation: <b>{obligationPlanned}</b>
            </p>
          </div>
        </div>

        {/* Expenditure Status to Date */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium underline">
            Expenditure Status to Date
          </h3>

          <Chart
            chartType="PieChart"
            data={dataPie(expenditureActual, expenditurePlanned)}
            options={expendOptionsPie(
              expenditureActual,
              expenditurePlanned,
              expen_red_coefficent,
              expen_yellow_coefficent
            )}
          />

          {/* Summary */}
          <div>
            <h2>Expenditure %:</h2>
            <h2 className="font-bold">
              {((expenditureActual / expenditurePlanned) * 100).toFixed(2)}%
            </h2>
            <p className="text-sm">
              Actual Expenditure: <b>{expenditureActual}</b>
            </p>
            <p className="text-sm">
              Planned Expenditure: <b>{expenditurePlanned}</b>
            </p>
          </div>
        </div>
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

//Add red AND yellow coeff to parameters
const getPieColor = (
  actual: number,
  planned: number,
  rCoefficent: number,
  yCoefficent: number
) => {
  if (actual / planned > 2) return "black";
  const red_coefficent = rCoefficent / 100;
  const yellow_coefficent = yCoefficent / 100;
  console.log(planned * (1 - red_coefficent));
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
