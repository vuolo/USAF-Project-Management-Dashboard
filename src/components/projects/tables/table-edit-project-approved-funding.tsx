import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { api } from "~/utils/api";
import type { approved_funding, funding_types } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { view_project } from "~/types/view_project";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

type TableProps = {
  project: view_project;
  approvedFunding?: approved_funding[];
  fundingTypes?: funding_types[];
  refetchApprovedFunding: <TPageData>(
    options?: RefetchOptions & RefetchQueryFilters<TPageData>
  ) => Promise<QueryObserverResult<unknown, unknown>>;
};

function TableEditApprovedFunding({
  project,
  approvedFunding,
  fundingTypes,
  refetchApprovedFunding,
}: TableProps) {
  const router = useRouter();

  const [editableApprovedFunding, setEditableApprovedFunding] = useState<
    approved_funding[]
  >([]);
  const [addFYCurrent, setAddFYCurrent] = useState<number | null>(null);
  const [addFTCurrent, setAddFTCurrent] = useState<number | null>(null);

  const [addApprovedFunding_FY, setAddApprovedFunding_FY] = useState<
    number | null
  >(null);
  const [addApprovedFunding_FT, setAddApprovedFunding_FT] = useState<
    number | null
  >(null);

  const [fiscalYears, setFiscalYears] = useState<number[]>([]);
  const [activeFundingTypeIds, setActiveFundingTypeIds] = useState<number[]>(
    []
  );

  // Sync editableApprovedFunding fiscal years and funding types on remove

  useEffect(() => {
    // For each approved funding, add the fiscal year to the list of fiscal years,
    // and add the funding type to the list of active funding types
    approvedFunding?.forEach((aprFunding) => {
      if (
        aprFunding.appro_fiscal_year !== null &&
        !fiscalYears.includes(aprFunding.appro_fiscal_year)
      )
        setFiscalYears((prev) => [
          ...prev.filter((fy) => fy !== aprFunding.appro_fiscal_year),
          aprFunding.appro_fiscal_year as number,
        ]);

      if (
        aprFunding.appro_funding_type !== null &&
        !activeFundingTypeIds.includes(aprFunding.appro_funding_type)
      )
        setActiveFundingTypeIds((prev) => [
          ...prev.filter((ft) => ft !== aprFunding.appro_funding_type),
          aprFunding.appro_funding_type as number,
        ]);
    });
  }, [approvedFunding, fiscalYears, activeFundingTypeIds]);

  // Listen for changes in approvedFunding, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!approvedFunding) return;
    setEditableApprovedFunding((prev) =>
      [
        ...prev,
        ...approvedFunding.filter(
          (aprFunding) =>
            !prev.find((prevAprFunding) => prevAprFunding.id === aprFunding.id)
        ),
      ]
        // remove all from new array that are not in approvedFunding (check ids)
        .filter((aprFunding) =>
          approvedFunding.find(
            (prevAprFunding) => prevAprFunding.id === aprFunding.id
          )
        )
    );
  }, [approvedFunding, editableApprovedFunding.length]);

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
      // toast.success(
      //   toastMessage(
      //     "Approved Funding Updated",
      //     "The approved funding has been updated successfully."
      //   )
      // );
      // Refresh UI data for modal
      // router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitUpdateApprovedFunding = useCallback(async () => {
    await Promise.all(
      editableApprovedFunding.map((approvedFund) => {
        if (
          typeof approvedFund.id !== "number" ||
          typeof approvedFund.project_id !== "number" ||
          typeof approvedFund.appro_fiscal_year !== "number" ||
          typeof approvedFund.appro_funding_type !== "number" ||
          typeof approvedFund.approved_amount !== "number"
        )
          return;

        return updateApprovedFunding.mutateAsync({
          approvedID: approvedFund.id,
          projectID: approvedFund.project_id,
          appro_funding_type: approvedFund.appro_funding_type,
          appro_fiscal_year: approvedFund.appro_fiscal_year,
          approved_amount: approvedFund.approved_amount,
        });
      })
    );

    toast.success(
      toastMessage(
        "Approved Funding Updated",
        "The approved funding has been updated successfully."
      )
    );

    await refetchApprovedFunding();
  }, [refetchApprovedFunding, updateApprovedFunding, editableApprovedFunding]);

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
      // toast.success(
      //   toastMessage(
      //     "Approved Funding Added",
      //     "The approved funding has been added successfully."
      //   )
      // );
      // Refresh UI data for modal
      // router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitAddFiscalYear = useCallback(async () => {
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
    await Promise.all(
      activeFundingTypeIds.map((fundingTypeID) => {
        return addApprovedFunding.mutateAsync({
          projectID: project.id,
          appro_funding_type: fundingTypeID,
          appro_fiscal_year: addFYCurrent,
          approved_amount: 0,
        });
      })
    );

    toast.success(
      toastMessage(
        "Fiscal Year Added",
        "The fiscal year has been added successfully."
      )
    );

    // Add the new fiscal year to the list of fiscal years
    setFiscalYears((p) => [...p, addFYCurrent]);

    // Reset the add fiscal year state
    setAddFYCurrent(null);

    await refetchApprovedFunding();
  }, [
    refetchApprovedFunding,
    addFYCurrent,
    fiscalYears,
    activeFundingTypeIds,
    addApprovedFunding,
    project,
  ]);

  const submitAddFundingType = useCallback(async () => {
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
    await Promise.all(
      fiscalYears.map((fiscalYear) => {
        return addApprovedFunding.mutateAsync({
          projectID: project.id,
          appro_funding_type: addFTCurrent,
          appro_fiscal_year: fiscalYear,
          approved_amount: 0,
        });
      })
    );

    toast.success(
      toastMessage(
        "Approved Funding Added",
        "The approved funding has been added successfully."
      )
    );

    // Add the new funding type to the list of funding types
    setActiveFundingTypeIds((p) => [...p, addFTCurrent]);

    // Reset the add funding type state
    setAddFTCurrent(null);

    // Refresh UI data for modal
    await refetchApprovedFunding();
  }, [
    refetchApprovedFunding,
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
      // toast.success(
      //   toastMessage(
      //     "Approved Funding Removed",
      //     "The approved funding has been removed successfully."
      //   )
      // );
      // Refresh UI data for modal
      // router.reload(); // This is a temporary, hacky solution
    },
  });

  const submitRemoveFiscalYear = useCallback(
    async (fiscalYear: number) => {
      await Promise.all(
        editableApprovedFunding.map((approvedFund) => {
          if (approvedFund.appro_fiscal_year !== fiscalYear) return;

          return removeApprovedFunding.mutateAsync({
            approvedID: approvedFund.id,
          });
        })
      );

      toast.success(
        toastMessage(
          "Fiscal Year Removed",
          "The fiscal year has been removed successfully."
        )
      );

      // Refresh UI data for modal
      await refetchApprovedFunding();

      setFiscalYears((prev) => prev.filter((fy) => fy !== fiscalYear));
    },
    [refetchApprovedFunding, editableApprovedFunding, removeApprovedFunding]
  );

  const submitRemoveFundingType = useCallback(
    async (fundingTypeID: number) => {
      await Promise.all(
        editableApprovedFunding.map((approvedFund) => {
          if (approvedFund.appro_funding_type !== fundingTypeID) return;

          return removeApprovedFunding.mutateAsync({
            approvedID: approvedFund.id,
          });
        })
      );

      toast.success(
        toastMessage(
          "Funding Type Removed",
          "The funding type has been removed successfully."
        )
      );

      // Refresh UI data for modal
      await refetchApprovedFunding();

      setActiveFundingTypeIds((prev) =>
        prev.filter((ft) => ft !== fundingTypeID)
      );
    },
    [refetchApprovedFunding, editableApprovedFunding, removeApprovedFunding]
  );

  const submitAddApprovedFunding = useCallback(() => {
    if (!addApprovedFunding_FY || !addApprovedFunding_FT) {
      toast.error(
        toastMessage(
          "Could Not Add Approved Funding",
          "Please make sure you have both a fiscal year and funding type entered first."
        )
      );
      return;
    }

    addApprovedFunding.mutate({
      projectID: project.id,
      appro_funding_type: addApprovedFunding_FT,
      appro_fiscal_year: addApprovedFunding_FY,
      approved_amount: 0,
    });
  }, [
    addApprovedFunding,
    project,
    addApprovedFunding_FT,
    addApprovedFunding_FY,
  ]);

  return (
    <div className="flex flex-row items-center gap-2 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
      <div className="flex w-fit flex-col items-center gap-4 p-2 text-center">
        <div className="mt-2 flex flex-col items-center">
          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
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
                  // Add Approved Funding Section
                  <div className="flex h-64 w-full flex-col items-center justify-center gap-2 px-8">
                    <h2 className="font-bold">Add Approved Funding</h2>

                    {/* Input: Fiscal Year (addApprovedFunding_FY) */}
                    <form
                      onSubmit={(e) => e.preventDefault()}
                      className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                    >
                      <label htmlFor="add-fiscal-year">Fiscal Year (YY)</label>
                      <input
                        type="number"
                        name="add-fiscal-year"
                        id="add-fiscal-year"
                        className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g. '23'"
                        min={0}
                        max={99}
                        value={Number(addApprovedFunding_FY)}
                        onChange={(e) =>
                          setAddApprovedFunding_FY(Number(e.target.value))
                        }
                      />
                    </form>

                    {/* Select: Funding Type (addApprovedFunding_FT) */}
                    <form
                      onSubmit={(e) => e.preventDefault()}
                      className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                    >
                      <label htmlFor="add-funding-type">Funding Type</label>
                      <select
                        name="add-funding-type"
                        id="add-funding-type"
                        className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                        value={addApprovedFunding_FT || ""}
                        onChange={(e) =>
                          setAddApprovedFunding_FT(Number(e.target.value))
                        }
                      >
                        <option value="">Select...</option>
                        {fundingTypes &&
                          fundingTypes.map((fundingType) => (
                            <option key={fundingType.id} value={fundingType.id}>
                              {fundingType.funding_type}
                            </option>
                          ))}
                      </select>
                    </form>

                    {/* Add New Button */}
                    <button
                      type="button"
                      className="mt-2 inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto sm:text-sm"
                      onClick={() => void submitAddApprovedFunding()}
                    >
                      Submit Approved Funding
                    </button>
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
                                  void submitRemoveFiscalYear(fiscalYear)
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
                              onClick={() => void submitAddFiscalYear()}
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
                                    void submitRemoveFundingType(
                                      activeFundingTypeId
                                    )
                                  }
                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                />
                              </div>
                            </td>

                            {fiscalYears.map((fiscalYear) =>
                              editableApprovedFunding.map(
                                (approvedFund, approvedFundIdx) =>
                                  approvedFund.appro_fiscal_year ===
                                    fiscalYear &&
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
                                            setEditableApprovedFunding(
                                              editableApprovedFunding.map(
                                                (approvedFund, idx) =>
                                                  idx === approvedFundIdx
                                                    ? {
                                                        ...approvedFund,
                                                        approved_amount: Number(
                                                          e.target.value
                                                        ) as unknown as Prisma.Decimal,
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
                                className="w-fit min-w-[15rem] rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              onClick={() => void submitAddFundingType()}
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

              {approvedFunding?.length !== 0 && (
                <div className="mt-4 flex justify-start">
                  <button
                    type="button"
                    className="inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto sm:text-sm"
                    onClick={() => void submitUpdateApprovedFunding()}
                  >
                    Save Updated Fields
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableEditApprovedFunding;
