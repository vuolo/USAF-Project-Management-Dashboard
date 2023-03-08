import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { AlertTriangle, CalendarClock, Scroll } from "lucide-react";
import { format } from "date-fns";
import { isInvalidDate } from "~/utils/date";
import { api } from "~/utils/api";
import type { contract_award, contract_award_timeline } from "@prisma/client";
import type { view_project } from "~/types/view_project";

type ModalProps = {
  project?: view_project | null;
  contractAwardTimeline?: contract_award_timeline[] | null;
  contractAward?: contract_award | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectContractStatus({
  project,
  contractAwardTimeline,
  contractAward,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);
      setIsOpen(false);

      // if (save) { }
    },
    [setIsOpen]
  );

  useEffect(() => {
    if (isOpen) openModal();
  }, [isOpen, openModal]);

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {
          closeModal(false);
        }}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[95%] sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CalendarClock
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Edit Contract Award Timeline
                    </Dialog.Title>

                    <div className="flex flex-col justify-around gap-2 pt-4 pb-2 text-left sm:px-6 sm:pt-6 md:flex-row">
                      <div className="flex w-full flex-col gap-4 overflow-auto p-2 text-center">
                        <div className="mt-2 flex flex-col">
                          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                                  <table className="min-w-full divide-y divide-gray-300">
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
                                          Approved at ABC
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
                                      {/* TODO: add editable date pickers */}
                                      {contractAwardTimeline &&
                                        contractAwardTimeline.map(
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
                                                {!isInvalidDate(
                                                  timeline.requirement_plan
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.requirement_plan ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.draft_rfp_released
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.draft_rfp_released ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.approved_by_acb
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.approved_by_acb ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.rfp_released
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.rfp_released ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.proposal_received
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.proposal_received ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.tech_eval_comp
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.tech_eval_comp ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.negotiation_comp
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.negotiation_comp ||
                                                          ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
                                              </td>
                                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {!isInvalidDate(
                                                  timeline.awarded
                                                )
                                                  ? format(
                                                      new Date(
                                                        timeline.awarded || ""
                                                      ),
                                                      "MM/dd/yyyy"
                                                    )
                                                  : "..."}
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
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => closeModal(true)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => closeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default ModalEditProjectContractStatus;
