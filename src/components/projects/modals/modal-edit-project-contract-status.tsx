import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { CalendarClock, Trash2 } from "lucide-react";
import {
  convertDateToDayValue,
  convertDayValueToDate,
  isInvalidDate,
} from "~/utils/date";
import { api } from "~/utils/api";
import type { contract_award_timeline } from "@prisma/client";
import type { contract_award_timeline_using_day_values } from "~/types/contract_award_timeline_using_day_values";
import DatePicker, {
  type DayValue,
} from "@hassanmojab/react-modern-calendar-datepicker";

type ModalProps = {
  contractAwardTimeline?: contract_award_timeline[] | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectContractStatus({
  contractAwardTimeline,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [contractAwardTimeline_editState, setContractAwardTimeline_editState] =
    useState<contract_award_timeline_using_day_values[]>([]);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Listen for changes in contractAwardTimeline, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!contractAwardTimeline || contractAwardTimeline_editState.length > 0)
      return;

    setContractAwardTimeline_editState(
      contractAwardTimeline.map((t) =>
        // Convert each date to a DayValue object (this is used by the date picker)
        ({
          ...t,
          requirement_plan: isInvalidDate(t.requirement_plan)
            ? null
            : convertDateToDayValue(t.requirement_plan),
          draft_rfp_released: isInvalidDate(t.draft_rfp_released)
            ? null
            : convertDateToDayValue(t.draft_rfp_released),
          approved_by_acb: isInvalidDate(t.approved_by_acb)
            ? null
            : convertDateToDayValue(t.approved_by_acb),
          rfp_released: isInvalidDate(t.rfp_released)
            ? null
            : convertDateToDayValue(t.rfp_released),
          proposal_received: isInvalidDate(t.proposal_received)
            ? null
            : convertDateToDayValue(t.proposal_received),
          tech_eval_comp: isInvalidDate(t.tech_eval_comp)
            ? null
            : convertDateToDayValue(t.tech_eval_comp),
          negotiation_comp: isInvalidDate(t.negotiation_comp)
            ? null
            : convertDateToDayValue(t.negotiation_comp),
          awarded: isInvalidDate(t.awarded)
            ? null
            : convertDateToDayValue(t.awarded),
        })
      ) as contract_award_timeline_using_day_values[]
    );
  }, [contractAwardTimeline, contractAwardTimeline_editState.length]);

  const updateContractAwardTimeline =
    api.contract.updateContractAwardTimeline.useMutation({
      onError: (error) => {
        toast.error(
          toastMessage(
            "Error Updating Contract Award Timeline",
            "There was an error updating the contract award timeline. Please try again."
          )
        );
        console.error(error);
      },
      onSuccess: () => {
        toast.success(
          toastMessage(
            "Contract Award Timeline Updated",
            "The contract award timeline has been updated."
          )
        );

        // Update UI to reflect new data
        router.reload(); // For now, just reload the page instead of updating the UI (this is a bit hacky, but it works for now)
      },
    });

  const submitUpdateContractAwardTimeline = useCallback(() => {
    // Convert each DayValue to a Date (this is used by the database)
    contractAwardTimeline_editState.map(
      (t) =>
        t.timeline_status &&
        t.hasBeenUpdated &&
        updateContractAwardTimeline.mutate({
          id: t.id,
          contract_award_id: t.contract_award_id,
          timeline_status: t.timeline_status,
          requirement_plan: t.requirement_plan
            ? convertDayValueToDate(t.requirement_plan, 1)
            : new Date("December 31, 1969"),
          draft_rfp_released: t.draft_rfp_released
            ? convertDayValueToDate(t.draft_rfp_released, 1)
            : new Date("December 31, 1969"),
          approved_by_acb: t.approved_by_acb
            ? convertDayValueToDate(t.approved_by_acb, 1)
            : new Date("December 31, 1969"),
          rfp_released: t.rfp_released
            ? convertDayValueToDate(t.rfp_released, 1)
            : new Date("December 31, 1969"),
          proposal_received: t.proposal_received
            ? convertDayValueToDate(t.proposal_received, 1)
            : new Date("December 31, 1969"),
          tech_eval_comp: t.tech_eval_comp
            ? convertDayValueToDate(t.tech_eval_comp, 1)
            : new Date("December 31, 1969"),
          negotiation_comp: t.negotiation_comp
            ? convertDayValueToDate(t.negotiation_comp, 1)
            : new Date("December 31, 1969"),
          awarded: t.awarded ? convertDayValueToDate(t.awarded) : undefined,
        })
    );
  }, [contractAwardTimeline_editState, updateContractAwardTimeline]);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);
      setIsOpen(false);

      if (save) submitUpdateContractAwardTimeline();

      // Reset the edit state
      setTimeout(() => {
        setContractAwardTimeline_editState([]);
      }, 500);
    },
    [setIsOpen, submitUpdateContractAwardTimeline]
  );

  useEffect(() => {
    if (isOpen) openModal();
  }, [isOpen, openModal]);

  const updateDate = useCallback(
    (timelineIndex: number, dateType: string, date: DayValue) => {
      setContractAwardTimeline_editState((prev) => {
        return prev.map((t, i) => {
          if (i === timelineIndex) {
            return {
              ...t,
              [dateType]: date,
              hasBeenUpdated: true,
            };
          }

          return t;
        });
      });
    },
    []
  );

  const clearDate = useCallback((timelineIndex: number, dateType: string) => {
    setContractAwardTimeline_editState((prev) => {
      return prev.map((t, i) => {
        if (i === timelineIndex) {
          return {
            ...t,
            [dateType]: null,
            hasBeenUpdated: true,
          };
        }

        return t;
      });
    });
  }, []);

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={saveButtonRef}
        onClose={() => {
          closeModal(false);
        }}
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
                        <CalendarClock
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span>Edit Contract Award Timeline</span>
                    </Dialog.Title>

                    <div className="mx-auto flex flex-row items-center justify-center gap-2 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
                      <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 p-2 text-center">
                        <div className="mt-2 flex flex-col items-center justify-center">
                          <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                {!contractAwardTimeline ? (
                                  <div className="flex h-64 items-center justify-center px-64">
                                    <div className="italic text-gray-500">
                                      Loading...
                                    </div>
                                  </div>
                                ) : contractAwardTimeline.length === 0 ? (
                                  <div className="flex h-64 w-full items-center justify-center px-8">
                                    <div className="italic text-gray-500">
                                      This project has no contract award
                                      timeline.
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
                                          Timeline Status
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Requirements Planning
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Draft RFP Released
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Approved at ACB
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          RFP Released
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Proposal Received
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Tech Eval Complete
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Negotiations Complete
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Awarded
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                      {contractAwardTimeline_editState.map(
                                        (timeline, timelineIdx) => (
                                          <tr
                                            key={timeline.id}
                                            className={
                                              timelineIdx % 2 === 0
                                                ? undefined
                                                : "bg-gray-50"
                                            }
                                          >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                              {timeline.timeline_status}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="z-50 flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.requirement_plan
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "requirement_plan",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />

                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "requirement_plan"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.draft_rfp_released
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "draft_rfp_released",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "draft_rfp_released"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.approved_by_acb
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "approved_by_acb",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "approved_by_acb"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={timeline.rfp_released}
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "rfp_released",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "rfp_released"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.proposal_received
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "proposal_received",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "proposal_received"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.tech_eval_comp
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "tech_eval_comp",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "tech_eval_comp"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    timeline.negotiation_comp
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "negotiation_comp",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "negotiation_comp"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={timeline.awarded}
                                                  onChange={(date) =>
                                                    updateDate(
                                                      timelineIdx,
                                                      "awarded",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      timelineIdx,
                                                      "awarded"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                )}
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
                    ref={saveButtonRef}
                    type="button"
                    className="inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(true)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 ml-3 inline-flex w-fit justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(false)}
                  >
                    Cancel
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

export default ModalEditProjectContractStatus;
