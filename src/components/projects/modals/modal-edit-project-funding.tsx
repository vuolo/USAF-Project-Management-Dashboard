import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { Landmark, Plus, PlusCircle, Trash2 } from "lucide-react";
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
import type { Decimal } from "@prisma/client/runtime";
import type { obligation_plan } from "~/types/obligation_plan";
import type { expenditure_plan } from "~/types/expenditure_plan";
import type { view_project } from "~/types/view_project";

import TableEditApprovedFunding from "../tables/table-edit-project-approved-funding";
import TableEditObligationPlan from "../tables/table-edit-project-obligation-plan";
import TableEditExpenditurePlan from "../tables/table-edit-project-expenditure-plan";

type ModalProps = {
  project: view_project;
  obligationPlan?: obligation_plan[];
  expenditurePlan?: expenditure_plan[];
  approvedFunding?: approved_funding[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectFunding({
  project,
  obligationPlan,
  expenditurePlan,
  approvedFunding,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const { data: fundingTypes } = api.funding_type.getAll.useQuery();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [obligationPlan_editState, setObligationPlan_editState] = useState<
    obligation_plan[]
  >([]);
  const [expenditurePlan_editState, setExpenditurePlan_editState] = useState<
    expenditure_plan[]
  >([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsOpen(false);
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

                    {/* Edit Approved Funding Table */}
                    <TableEditApprovedFunding
                      project={project}
                      approvedFunding={approvedFunding}
                      fundingTypes={fundingTypes}
                    />

                    {/* Edit Obligation Plan Table */}
                    <TableEditObligationPlan
                      project={project}
                      obligationPlan={obligationPlan}
                      fundingTypes={fundingTypes}
                    />

                    {/* Edit Expenditure Plan Table */}
                    <TableEditExpenditurePlan
                      expenditurePlan={expenditurePlan}
                    />
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
