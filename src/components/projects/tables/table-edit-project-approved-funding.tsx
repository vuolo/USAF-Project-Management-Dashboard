import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { api } from "~/utils/api";
import type { approved_funding, funding_types } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime";
import type { view_project } from "~/types/view_project";

type TableProps = {
  project: view_project;
  approvedFunding?: approved_funding[];
  fundingTypes?: funding_types[];
};

function TableEditApprovedFunding({
  project,
  approvedFunding,
  fundingTypes,
}: TableProps) {
  const router = useRouter();

  const [editState, setEditState] = useState<approved_funding[]>([]);
  const [addFYCurrent, setAddFYCurrent] = useState<number | null>(null);
  const [addFTCurrent, setAddFTCurrent] = useState<number | null>(null);

  const fiscalYears: number[] = [];
  const activeFundingTypeIds: number[] = [];

  // For each approved funding, add the fiscal year to the list of fiscal years,
  // and add the funding type to the list of active funding types
  approvedFunding?.forEach((approvedFunding) => {
    if (
      approvedFunding.appro_fiscal_year !== null &&
      !fiscalYears.includes(approvedFunding.appro_fiscal_year)
    )
      fiscalYears.push(approvedFunding.appro_fiscal_year);

    if (
      approvedFunding.appro_funding_type !== null &&
      !activeFundingTypeIds.includes(approvedFunding.appro_funding_type)
    )
      activeFundingTypeIds.push(approvedFunding.appro_funding_type);
  });

  // Listen for changes in approvedFunding, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!approvedFunding || editState.length > 0) return;
    setEditState([...approvedFunding]);
  }, [approvedFunding, editState.length]);

  const updateApprovedFunding = api.approved.updateApprovedFunding.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Updating Approved Funding",
          "There was an error updating the approved funding. Please try again later."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "Approved Funding Updated",
          "The approved funding has been updated successfully."
        )
      );

      // Refresh UI data for modal
      router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitUpdateApprovedFunding = useCallback(() => {
    editState.forEach((approvedFund) => {
      if (
        typeof approvedFund.id !== "number" ||
        typeof approvedFund.project_id !== "number" ||
        typeof approvedFund.appro_fiscal_year !== "number" ||
        typeof approvedFund.appro_funding_type !== "number" ||
        typeof approvedFund.approved_amount !== "number"
      )
        return;

      updateApprovedFunding.mutate({
        approvedID: approvedFund.id,
        projectID: approvedFund.project_id,
        appro_funding_type: approvedFund.appro_funding_type,
        appro_fiscal_year: approvedFund.appro_fiscal_year,
        approved_amount: approvedFund.approved_amount,
      });
    });
  }, [updateApprovedFunding, editState]);

  const addApprovedFunding = api.approved.addApprovedFunding.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Approved Funding",
          "There was an error adding the approved funding. Please try again later."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "Approved Funding Added",
          "The approved funding has been added successfully."
        )
      );

      // Refresh UI data for modal
      router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitAddFiscalYear = useCallback(() => {
    if (!addFYCurrent) {
      toast.error(
        toastMessage(
          "Error Adding Fiscal Year",
          "Please select a fiscal year to add."
        )
      );
      return;
    }

    if (fiscalYears.includes(addFYCurrent)) {
      toast.error(
        toastMessage(
          "Error Adding Fiscal Year",
          "The selected fiscal year is already added."
        )
      );
      return;
    }

    // For each funding type, add a new approved fiscal year
    activeFundingTypeIds.forEach((fundingTypeID) => {
      addApprovedFunding.mutate({
        projectID: project.id,
        appro_funding_type: fundingTypeID,
        appro_fiscal_year: addFYCurrent,
        approved_amount: 0,
      });
    });

    // Add the new fiscal year to the list of fiscal years
    fiscalYears.push(addFYCurrent);

    // Reset the add fiscal year state
    setAddFYCurrent(null);
  }, [
    addFYCurrent,
    fiscalYears,
    activeFundingTypeIds,
    addApprovedFunding,
    project,
  ]);

  const submitAddFundingType = useCallback(() => {
    if (!addFTCurrent) {
      toast.error(
        toastMessage(
          "Error Adding Funding Type",
          "Please select a funding type to add."
        )
      );
      return;
    }

    if (activeFundingTypeIds.includes(addFTCurrent)) {
      toast.error(
        toastMessage(
          "Error Adding Funding Type",
          "The selected funding type is already added."
        )
      );
      return;
    }

    // For each fiscal year, add a new approved funding type
    fiscalYears.forEach((fiscalYear) => {
      addApprovedFunding.mutate({
        projectID: project.id,
        appro_funding_type: addFTCurrent,
        appro_fiscal_year: fiscalYear,
        approved_amount: 0,
      });
    });

    // Add the new funding type to the list of funding types
    activeFundingTypeIds.push(addFTCurrent);

    // Reset the add funding type state
    setAddFTCurrent(null);
  }, [
    addFTCurrent,
    fiscalYears,
    activeFundingTypeIds,
    addApprovedFunding,
    project,
  ]);

  const removeApprovedFunding = api.approved.removeApprovedFunding.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Approved Funding",
          "There was an error removing the approved funding. Please try again later."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "Approved Funding Removed",
          "The approved funding has been removed successfully."
        )
      );

      // Refresh UI data for modal
      router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitRemoveFiscalYear = useCallback(
    (fiscalYear: number) => {
      editState.forEach((approvedFund) => {
        if (approvedFund.appro_fiscal_year !== fiscalYear) return;

        removeApprovedFunding.mutate({
          approvedID: approvedFund.id,
        });
      });
    },
    [editState, removeApprovedFunding]
  );

  const submitRemoveFundingType = useCallback(
    (fundingTypeID: number) => {
      editState.forEach((approvedFund) => {
        if (approvedFund.appro_funding_type !== fundingTypeID) return;

        removeApprovedFunding.mutate({
          approvedID: approvedFund.id,
        });
      });
    },
    [editState, removeApprovedFunding]
  );

  return (
    <div className="mx-auto flex flex-row items-center justify-center gap-2 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 p-2 text-center">
        <div className="mt-2 flex flex-col items-center lg:justify-center">
          <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="mb-4 sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-left text-xl font-semibold text-gray-900">
                    Approved Funding
                  </h1>
                </div>
              </div>

              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {!approvedFunding ? (
                  <div className="flex h-64 items-center justify-center px-64">
                    <div className="italic text-gray-500">Loading...</div>
                  </div>
                ) : approvedFunding.length === 0 ? (
                  <div className="flex h-64 w-full items-center justify-center px-8">
                    <div className="italic text-gray-500">
                      TODO: Add approved funding section
                    </div>
                  </div>
                ) : (
                  <table className="mx-auto min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Funding Type
                        </th>
                        {fiscalYears.map((fiscalYear) => (
                          <th
                            key={fiscalYear}
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span>FY&apos;{fiscalYear}</span>
                              <Trash2
                                onClick={() =>
                                  submitRemoveFiscalYear(fiscalYear)
                                }
                                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                              />
                            </div>
                          </th>
                        ))}
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <label htmlFor="fiscal-year">Add FY&apos;</label>
                            <input
                              type="number"
                              min={0}
                              max={99}
                              className="w-14 rounded-md border border-gray-300 px-2 py-1 text-center text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="YY"
                              value={addFYCurrent || ""}
                              onChange={(e) => {
                                setAddFYCurrent(Number(e.target.value));
                              }}
                            />
                            <PlusCircle
                              onClick={submitAddFiscalYear}
                              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-green-500"
                            />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {fundingTypes &&
                        activeFundingTypeIds.map((activeFundingTypeId, idx) => (
                          <tr
                            key={activeFundingTypeId}
                            className={idx % 2 === 0 ? undefined : "bg-gray-50"}
                          >
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                              <div className="flex items-center justify-center gap-2">
                                <span>
                                  {fundingTypes.find(
                                    (fundingType) =>
                                      fundingType.id === activeFundingTypeId
                                  )?.funding_type ?? "..."}
                                </span>
                                <Trash2
                                  onClick={() =>
                                    submitRemoveFundingType(activeFundingTypeId)
                                  }
                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                />
                              </div>
                            </td>

                            {fiscalYears.map((fiscalYear) =>
                              editState.map((approvedFund, approvedFundIdx) =>
                                approvedFund.appro_fiscal_year === fiscalYear &&
                                approvedFund.appro_funding_type ===
                                  activeFundingTypeId ? (
                                  <td
                                    key={approvedFundIdx}
                                    className="px-3 py-4 text-sm text-gray-500"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>$</span>
                                      <input
                                        type="number"
                                        step={0.01}
                                        className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={Number(
                                          approvedFund.approved_amount
                                        )}
                                        onChange={(e) =>
                                          setEditState(
                                            editState.map((approvedFund, idx) =>
                                              idx === approvedFundIdx
                                                ? {
                                                    ...approvedFund,
                                                    approved_amount: Number(
                                                      e.target.value
                                                    ) as unknown as Decimal,
                                                  }
                                                : approvedFund
                                            )
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                ) : null
                              )
                            )}
                            <td className="px-3 py-4 text-sm text-gray-500">
                              <span>...</span>
                            </td>
                          </tr>
                        ))}
                      <tr
                        className={
                          activeFundingTypeIds.length % 2 === 0
                            ? undefined
                            : "bg-gray-50"
                        }
                      >
                        <td className="px-3 py-4 text-sm text-black">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex flex-col">
                              <select
                                className="w-fit rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={addFTCurrent || ""}
                                onChange={(e) =>
                                  setAddFTCurrent(Number(e.target.value))
                                }
                              >
                                <option value="">Add a New Funding Type</option>
                                {fundingTypes &&
                                  fundingTypes.map((fundingType) => (
                                    <option
                                      key={fundingType.id}
                                      value={fundingType.id}
                                    >
                                      {fundingType.funding_type}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <PlusCircle
                              onClick={submitAddFundingType}
                              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-green-500"
                            />
                          </div>
                        </td>
                        {fiscalYears.map((fiscalYear) => (
                          <td
                            key={fiscalYear}
                            className="px-3 py-4 text-sm text-gray-500"
                          >
                            <span>...</span>
                          </td>
                        ))}
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <span>...</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              <div className="mt-4 flex justify-start lg:justify-center">
                <button
                  type="button"
                  className="inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto sm:text-sm"
                  onClick={submitUpdateApprovedFunding}
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

export default TableEditApprovedFunding;
