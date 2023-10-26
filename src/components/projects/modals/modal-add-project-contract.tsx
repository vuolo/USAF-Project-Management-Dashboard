import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker, {
  type DayValue,
} from "@hassanmojab/react-modern-calendar-datepicker";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { CalendarClock } from "lucide-react";
import {
  addDays,
  convertDateToDayValue,
  convertDayValueToDate,
} from "~/utils/date";
import { api } from "~/utils/api";
import type { contract_award } from "@prisma/client";

type ModalProps = {
  contractAward?: contract_award | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalAddProjectContract({
  contractAward,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();
  const { data: daysAdded } = api.contract.getDaysAdded.useQuery();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  // Dates:
  const [requirementPlanDate, setRequirementPlanDate] =
    useState<DayValue>(null);
  const [draftRfpReleasedDate, setDraftRfpReleasedDate] =
    useState<DayValue>(null);
  const [approvedByAcbDate, setApprovedByAcbDate] = useState<DayValue>(null);
  const [rfpReleasedDate, setRfpReleasedDate] = useState<DayValue>(null);
  const [proposalReceivedDate, setProposalReceivedDate] =
    useState<DayValue>(null);
  const [techEvalCompDate, setTechEvalCompDate] = useState<DayValue>(null);
  const [negotiationCompDate, setNegotiationCompDate] =
    useState<DayValue>(null);
  const [awardedDate, setAwardedDate] = useState<DayValue>(null);

  // Listen for changes to the requirementPlanDate state, and update the
  // rest of the dates accordingly (using the daysAdded value from the API)
  useEffect(() => {
    if (!daysAdded || !requirementPlanDate) return;

    const requirementPlan_asDate = convertDayValueToDate(requirementPlanDate);
    if (!requirementPlan_asDate) return;

    // Set the rest of the dates
    const draftRfpReleased_asDate = addDays(
      requirementPlan_asDate,
      daysAdded.draft_rfp_released
    );
    const approvedByAcb_asDate = addDays(
      draftRfpReleased_asDate,
      daysAdded.approved_by_acb
    );
    const rfpReleased_asDate = addDays(
      approvedByAcb_asDate,
      daysAdded.rfp_released
    );
    const proposalReceived_asDate = addDays(
      rfpReleased_asDate,
      daysAdded.proposal_received
    );
    const techEvalComp_asDate = addDays(
      proposalReceived_asDate,
      daysAdded.tech_eval_comp
    );
    const negotiationComp_asDate = addDays(
      techEvalComp_asDate,
      daysAdded.negotiation_comp
    );
    const awarded_asDate = addDays(negotiationComp_asDate, daysAdded.awarded);

    // Update the rest of the dates
    setDraftRfpReleasedDate(convertDateToDayValue(draftRfpReleased_asDate));
    setApprovedByAcbDate(convertDateToDayValue(approvedByAcb_asDate));
    setRfpReleasedDate(convertDateToDayValue(rfpReleased_asDate));
    setProposalReceivedDate(convertDateToDayValue(proposalReceived_asDate));
    setTechEvalCompDate(convertDateToDayValue(techEvalComp_asDate));
    setNegotiationCompDate(convertDateToDayValue(negotiationComp_asDate));
    setAwardedDate(convertDateToDayValue(awarded_asDate));
  }, [daysAdded, requirementPlanDate]);

  const addContractAwardTimeline =
    api.contract.addContractAwardTimeline.useMutation({
      onError: (error) => {
        toast.error(
          toastMessage(
            "Error Adding Contract Award Timeline",
            "Please try again later, or contact support if the problem persists."
          )
        );
        console.error(error);
      },
      onSuccess: () => {
        toast.success(
          toastMessage(
            "Contract Award Timeline Added",
            "The contract award timeline has been added."
          )
        );

        // Refresh UI data
        router.reload(); // Note: This is a hacky way to refresh the UI data. We should find a better way to do this.
      },
    });

  const submitAddContractAwardTimeline = useCallback(() => {
    if (!contractAward) {
      toast.error(
        toastMessage(
          "Error Adding Contract Award Timeline",
          "The contract award is missing. Please try again later, or contact support if the problem persists."
        )
      );
      return;
    }

    if (
      !requirementPlanDate ||
      !draftRfpReleasedDate ||
      !approvedByAcbDate ||
      !rfpReleasedDate ||
      !proposalReceivedDate ||
      !techEvalCompDate ||
      !negotiationCompDate ||
      !awardedDate
    ) {
      toast.error(
        toastMessage(
          "Error Adding Contract Award Timeline",
          "Please fill out all required fields."
        )
      );
      return;
    }

    addContractAwardTimeline.mutate({
      contract_award_id: contractAward.id,
      requirement_plan: convertDayValueToDate(requirementPlanDate, 1) as Date,
      draft_rfp_released: convertDayValueToDate(
        draftRfpReleasedDate,
        1
      ) as Date,
      approved_by_acb: convertDayValueToDate(approvedByAcbDate, 1) as Date,
      rfp_released: convertDayValueToDate(rfpReleasedDate, 1) as Date,
      proposal_received: convertDayValueToDate(proposalReceivedDate, 1) as Date,
      tech_eval_comp: convertDayValueToDate(techEvalCompDate, 1) as Date,
      negotiation_comp: convertDayValueToDate(negotiationCompDate, 1) as Date,
      awarded: convertDayValueToDate(awardedDate, 1) as Date,
    });
  }, [
    addContractAwardTimeline,
    contractAward,
    requirementPlanDate,
    draftRfpReleasedDate,
    approvedByAcbDate,
    rfpReleasedDate,
    proposalReceivedDate,
    techEvalCompDate,
    negotiationCompDate,
    awardedDate,
  ]);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);

      if (save) submitAddContractAwardTimeline();

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        setRequirementPlanDate(undefined);
        setDraftRfpReleasedDate(undefined);
        setApprovedByAcbDate(undefined);
        setRfpReleasedDate(undefined);
        setProposalReceivedDate(undefined);
        setTechEvalCompDate(undefined);
        setNegotiationCompDate(undefined);
        setAwardedDate(undefined);
        setIsOpen(false);
      }, 500);
    },
    [setIsOpen, submitAddContractAwardTimeline]
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
        <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
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
            <div className="relative inline-block transform overflow-visible rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="rounded-lg bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CalendarClock
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add Contract Award Timeline
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-4">
                      {/* Requirement Plan */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Requirement Plan</label>
                        <DatePicker
                          value={requirementPlanDate}
                          onChange={setRequirementPlanDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* Draft RFP Released */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Draft RFP Released</label>
                        <DatePicker
                          value={draftRfpReleasedDate}
                          onChange={setDraftRfpReleasedDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* Approved by ACB */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Approved by ACB</label>
                        <DatePicker
                          value={approvedByAcbDate}
                          onChange={setApprovedByAcbDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* RFP Released */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>RFP Released</label>
                        <DatePicker
                          value={rfpReleasedDate}
                          onChange={setRfpReleasedDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* Proprosal Received */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Proprosal Received</label>
                        <DatePicker
                          value={proposalReceivedDate}
                          onChange={setProposalReceivedDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* Tech Eval Complete */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Tech Eval Complete</label>
                        <DatePicker
                          value={techEvalCompDate}
                          onChange={setTechEvalCompDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>

                      {/* Negotiation Complete */}
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label>Negotiation Complete</label>
                        <DatePicker
                          value={negotiationCompDate}
                          onChange={setNegotiationCompDate}
                          inputPlaceholder="Select a date"
                          inputClassName="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          calendarClassName="z-50"
                        />
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-b-lg bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => closeModal(true)}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
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

export default ModalAddProjectContract;
