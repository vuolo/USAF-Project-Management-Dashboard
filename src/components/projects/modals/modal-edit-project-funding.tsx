import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { Landmark, Trash2 } from "lucide-react";
import {
  convertDateToDayValue,
  convertDayValueToDate,
  isInvalidDate,
} from "~/utils/date";
import { api } from "~/utils/api";
import DatePicker, {
  type DayValue,
} from "@hassanmojab/react-modern-calendar-datepicker";
import type { approved_funding } from "@prisma/client";
import type { obligation_plan } from "~/types/obligation_plan";
import type { expenditure_plan } from "~/types/expenditure_plan";
import type { Decimal } from "@prisma/client/runtime";

type ModalProps = {
  obligationPlan?: obligation_plan[];
  expenditurePlan?: expenditure_plan[];
  approvedFunding?: approved_funding[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectFunding({
  obligationPlan,
  expenditurePlan,
  approvedFunding,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();
  const { data: fundingTypes } = api.funding_type.getAll.useQuery();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [obligationPlan_editState, setObligationPlan_editState] = useState<
    obligation_plan[]
  >([]);
  const [expenditurePlan_editState, setExpenditurePlan_editState] = useState<
    expenditure_plan[]
  >([]);
  const [approvedFunding_editState, setApprovedFunding_editState] = useState<
    approved_funding[]
  >([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const approvedFunding_fiscalYears: number[] = [];
  const approvedFunding_activeFundingTypeIds: number[] = [];

  // For each approved funding, add the fiscal year to the list of fiscal years,
  // and add the funding type to the list of active funding types
  approvedFunding?.forEach((approvedFunding) => {
    if (
      approvedFunding.appro_fiscal_year !== null &&
      !approvedFunding_fiscalYears.includes(approvedFunding.appro_fiscal_year)
    )
      approvedFunding_fiscalYears.push(approvedFunding.appro_fiscal_year);

    if (
      approvedFunding.appro_funding_type !== null &&
      !approvedFunding_activeFundingTypeIds.includes(
        approvedFunding.appro_funding_type
      )
    )
      approvedFunding_activeFundingTypeIds.push(
        approvedFunding.appro_funding_type
      );
  });

  // Listen for changes in approvedFunding, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!approvedFunding || approvedFunding_editState.length > 0) return;
    setApprovedFunding_editState([...approvedFunding]);
  }, [approvedFunding, approvedFunding_editState.length]);

  const updateApprovedFunding = api.approved.updateApprovedFunding.useMutation({
    onError(error) {
      toastMessage(
        "Error Updating Approved Funding",
        "There was an error updating the approved funding. Please try again later."
      );
      console.error(error);
    },
    onSuccess() {
      toastMessage(
        "Approved Funding Updated",
        "The approved funding has been updated successfully."
      );

      // TODO: refresh UI data for modal
    },
  });

  const submitUpdateApprovedFunding = useCallback(() => {
    approvedFunding_editState.forEach((approvedFund) => {
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
  }, [updateApprovedFunding, approvedFunding_editState]);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsOpen(false);

    // Reset the edit states
    setTimeout(() => {
      setObligationPlan_editState([]);
      setExpenditurePlan_editState([]);
      setApprovedFunding_editState([]);
    }, 500);
  }, [setIsOpen]);

  useEffect(() => {
    if (isOpen) openModal();
  }, [isOpen, openModal]);

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeButtonRef}
        onClose={closeModal}
      >
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative my-8 inline-block w-full max-w-full transform rounded-lg bg-white text-left align-middle shadow-xl transition-all">
              <div className="w-fit rounded-lg bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 2xl:w-full">
                <div className="flex items-start">
                  <div className="mr-2 mt-3 ml-4 w-full text-left">
                    <Dialog.Title
                      as="h3"
                      className="flex items-center gap-4 text-lg font-medium leading-6 text-gray-900"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <Landmark
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span>Edit Funding</span>
                    </Dialog.Title>

                    <div className="mx-auto flex flex-row items-center justify-center gap-2 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
                      <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 p-2 text-center">
                        <div className="mt-2 flex flex-col items-center justify-center">
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
                                    <div className="italic text-gray-500">
                                      Loading...
                                    </div>
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
                                        {approvedFunding_fiscalYears.map(
                                          (fiscalYear) => (
                                            <th
                                              key={fiscalYear}
                                              scope="col"
                                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                            >
                                              FY&apos;{fiscalYear}
                                            </th>
                                          )
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                      {fundingTypes &&
                                        approvedFunding_activeFundingTypeIds.map(
                                          (activeFundingTypeId, idx) => (
                                            <tr
                                              key={activeFundingTypeId}
                                              className={
                                                idx % 2 === 0
                                                  ? undefined
                                                  : "bg-gray-50"
                                              }
                                            >
                                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                                {fundingTypes.find(
                                                  (fundingType) =>
                                                    fundingType.id ===
                                                    activeFundingTypeId
                                                )?.funding_type ?? "..."}
                                              </td>
                                              {approvedFunding_fiscalYears.map(
                                                (fiscalYear) =>
                                                  approvedFunding_editState.map(
                                                    (
                                                      approvedFund,
                                                      approvedFundIdx
                                                    ) =>
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
                                                                setApprovedFunding_editState(
                                                                  approvedFunding_editState.map(
                                                                    (
                                                                      approvedFund,
                                                                      idx
                                                                    ) =>
                                                                      idx ===
                                                                      approvedFundIdx
                                                                        ? {
                                                                            ...approvedFund,
                                                                            approved_amount:
                                                                              Number(
                                                                                e
                                                                                  .target
                                                                                  .value
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
                                            </tr>
                                          )
                                        )}
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
                                  Save Approved Funding
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 gap-2 rounded-lg bg-gray-50 px-4 py-3 sm:flex sm:px-6">
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="mt-3 ml-3 inline-flex w-fit justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default ModalEditProjectFunding;
