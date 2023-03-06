import { api } from "~/utils/api";
import type { obligation_plan } from "~/types/obligation_plan";
import { formatCurrency } from "~/utils/currency";
import { format } from "date-fns";
import type { funding_types } from "@prisma/client";

type TableProps = {
  obligationPlan?: obligation_plan[];
};

function TableObligationPlan({ obligationPlan }: TableProps) {
  const { data: fundingTypes } = api.funding_type.getAll.useQuery();

  return (
    <>
      <div className="mt-4 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Obligation Plan
          </h1>
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!obligationPlan ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : obligationPlan.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No obligation plan to display.
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      ></th>
                      {obligationPlan.map((obli, obliIdx) => (
                        <th
                          key={obliIdx}
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {format(obli.date, "MM/dd/yyyy")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {obligationPlan &&
                      // There are 4 rows in the table.
                      [0, 1, 2, 3].map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={
                            rowIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                            {getRowName(rowIdx)}
                          </td>
                          {obligationPlan.map((obli, obliIdx) => (
                            <td
                              key={obliIdx}
                              className="px-3 py-4 text-sm text-gray-500"
                            >
                              {getRowValue(obli, rowIdx, fundingTypes)}
                            </td>
                          ))}
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

export default TableObligationPlan;

function getRowValue(
  obli: obligation_plan,
  rowIdx: number,
  fundingTypes?: funding_types[]
) {
  switch (rowIdx) {
    // Funding Type
    case 0:
      return (
        fundingTypes?.find((ft) => ft.id === Number(obli.FundingType))
          ?.funding_type || ""
      );

    // Fiscal Year
    case 1:
      return `FY'${obli.FiscalYear}`;

    // Projected
    case 2:
      return formatCurrency(obli.Projected);

    // Actual
    case 3:
      return formatCurrency(obli.Actual);

    default:
      return "";
  }
}

function getRowName(idx: number) {
  switch (idx) {
    case 0:
      return "Funding Type";
    case 1:
      return "Fiscal Year";
    case 2:
      return "Projected";
    case 3:
      return "Actual";
    default:
      return "";
  }
}
