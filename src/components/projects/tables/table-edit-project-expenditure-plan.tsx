import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import type { view_project } from "~/types/view_project";
import type { expenditure_plan } from "~/types/expenditure_plan";
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";
import { convertDateToString } from "~/utils/date";

type TableProps = {
  project: view_project;
  expenditurePlan?: expenditure_plan[];
  refetchExpenditurePlan: <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) => Promise<QueryObserverResult<unknown, unknown>>;
};

function TableEditExpenditurePlan({
  project,
  expenditurePlan,
  refetchExpenditurePlan,
}: TableProps) {
  const router = useRouter();

  const [editableExpenditurePlan, setEditableExpenditurePlan] = useState<
    expenditure_plan[]
  >([]);

  // Listen for changes in obligationPlan, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!expenditurePlan) return;
    setEditableExpenditurePlan((p) =>
      [...p, ...expenditurePlan.filter((x) => !p.find((y) => y.id === x.id))]
        // remove all from new array that are not in expenditurePlan (check ids)
        .filter((ExPlan) =>
          expenditurePlan.find((prevExPlan) => prevExPlan.id === ExPlan.id)
        )
    );
  }, [expenditurePlan, editableExpenditurePlan.length]);

  const updateExpenditure = api.expenditure.updateExpenditure.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Updating Expenditure Plan",
          "There was an error updating the expenditure plan. Please try again later."
        )
      );
      console.error(error);
    },
    onSuccess() {
      // Refresh UI data
      // router.reload(); // This is a hacky solution, but it works for now...
    },
  });

  const submitUpdateExpenditurePlan = useCallback(async () => {
    await Promise.all(
      editableExpenditurePlan.map(async (plan, idx) => {
        const prevExpenditure = expenditurePlan ? expenditurePlan[idx] : null;
        if (prevExpenditure?.date !== plan.date) {
          plan.date.setDate(plan.date.getDate());
        }

        return updateExpenditure.mutateAsync({
          id: plan.id,
          project_id: project.id,
          expen_funding_date: plan.date,
          expen_projected: Number(plan.Projected),
          expen_actual: Number(plan.Actual),
        });
      })
    );

    toast.success(
      toastMessage(
        "Expenditure Plan Updated",
        "The expenditure plan has been updated successfully."
      )
    );

    await refetchExpenditurePlan();
  }, [
    editableExpenditurePlan,
    updateExpenditure,
    project,
    expenditurePlan,
    refetchExpenditurePlan,
  ]);

  return (
    <div className="flex flex-row items-center gap-2 pb-2 pt-2 text-left sm:px-6">
      <div className="flex w-fit flex-col gap-4 p-2 text-center">
        <div className="mt-2 flex flex-col justify-center">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="mb-4 sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-left text-xl font-semibold text-gray-900">
                    Expenditure Plan
                  </h1>
                </div>
              </div>

              <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {!editableExpenditurePlan ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="italic text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        ></th>
                        {editableExpenditurePlan.map((expen, expenIdx) => (
                          <th
                            key={expenIdx}
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>{convertDateToString(expen.date)}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {editableExpenditurePlan &&
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
                            {editableExpenditurePlan.map((expen, expenIdx) => (
                              <td
                                key={expenIdx}
                                className="px-3 py-4 text-sm text-gray-500"
                              >
                                {getRowValue(
                                  expen,
                                  rowIdx,
                                  expenIdx,
                                  setEditableExpenditurePlan
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="mt-4 flex justify-start">
                <button
                  type="button"
                  className="inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto sm:text-sm"
                  onClick={() => void submitUpdateExpenditurePlan()}
                >
                  Save Updated Fields
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableEditExpenditurePlan;

function getRowValue(
  expen: expenditure_plan,
  rowIdx: number,
  expenIdx: number,
  setEditableExpenditurePlan: React.Dispatch<
    React.SetStateAction<expenditure_plan[]>
  >
) {
  switch (rowIdx) {
    // Projected
    case 0:
      return (
        <div className="flex items-center gap-2">
          <span>$</span>
          <input
            type="number"
            step={0.01}
            readOnly
            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={Number(expen.Projected)}
            onChange={(e) => {
              // Update projected
              setEditableExpenditurePlan((prev) =>
                prev.map((expen, idx) =>
                  idx === expenIdx
                    ? { ...expen, Projected: Number(e.target.value) }
                    : expen
                )
              );
            }}
          />
        </div>
      );

    // Actual
    case 1:
      return (
        <div className="flex items-center gap-2">
          <span>$</span>
          <input
            type="number"
            step={0.01}
            className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={Number(expen.Actual)}
            onChange={(e) => {
              // Update actual
              setEditableExpenditurePlan((prev) =>
                prev.map((expen, idx) =>
                  idx === expenIdx
                    ? { ...expen, Actual: Number(e.target.value) }
                    : expen
                )
              );
            }}
          />
        </div>
      );

    default:
      return "...";
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