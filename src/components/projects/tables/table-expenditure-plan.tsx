import { formatCurrency } from "~/utils/currency";
import { format } from "date-fns";
import type { expenditure_plan } from "~/types/expenditure_plan";

type TableProps = {
  expenditurePlan?: expenditure_plan[];
};

function TableExpenditurePlan({ expenditurePlan }: TableProps) {
  return (
    <>
      <div className="mt-4 sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Expenditure Plan
          </h1>
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!expenditurePlan ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : expenditurePlan.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No expenditure plan to display.
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
                      {expenditurePlan.map((expen, expenIdx) => (
                        <th
                          key={expenIdx}
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {format(expen.date, "MM/dd/yyyy")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {expenditurePlan &&
                      // There are 2 rows in the table.
                      [0, 1].map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={
                            rowIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                            {getRowName(rowIdx)}
                          </td>
                          {expenditurePlan.map((expen, expenIdx) => (
                            <td
                              key={expenIdx}
                              className="px-3 py-4 text-sm text-gray-500"
                            >
                              {getRowValue(expen, rowIdx)}
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

export default TableExpenditurePlan;

function getRowValue(expen: expenditure_plan, rowIdx: number) {
  switch (rowIdx) {
    // Projected
    case 0:
      return formatCurrency(expen.Projected);

    // Actual
    case 1:
      return formatCurrency(expen.Actual);

    default:
      return "";
  }
}

function getRowName(idx: number) {
  switch (idx) {
    case 0:
      return "Projected";
    case 1:
      return "Actual";
    default:
      return "";
  }
}
