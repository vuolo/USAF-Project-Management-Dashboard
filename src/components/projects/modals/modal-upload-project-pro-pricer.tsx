import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { Award, FilePlus2 } from "lucide-react";
import { api } from "~/utils/api";
import type { view_project } from "~/types/view_project";
import { parseProPricerFile } from "~/utils/file";
import { task_resource_table } from "@prisma/client";

type ModalProps = {
  project: view_project;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalUploadProjectProPricer({
  project,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const createManyWBS = api.wbs.createMany.useMutation({
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Successfully uploaded WBS",
          "The WBS has been successfully uploaded."
        )
      );

      // Close modal
      closeModal();
    },
    onError: (error) => {
      toast.error(
        toastMessage(
          "There was an error uploading the WBS",
          "If you are having trouble uploading a WBS, please contact your system administrator."
        )
      );
      console.error(error);
    },
  });

  const submitFileUpload = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Get file from input with id="file"
    const file = (document.getElementById("file") as HTMLInputElement)
      ?.files?.[0];

    // If no file is selected, show error toast
    if (!file) {
      toast.error(
        toastMessage(
          "Please select a file to upload",
          "If you are having trouble uploading a file, please contact your system administrator."
        )
      );
      return;
    }

    // Process the file on the client side
    void (async (file) => {
      try {
        const wbsArray = await parseProPricerFile(file, project.id);
        createManyWBS.mutate(
          (wbsArray as task_resource_table[]).map((wbs) => ({
            project_id: project.id,
            task_id: wbs.task_id,
            task_description: wbs.task_description,
            month: wbs.month || undefined,
            clin_num: Number(wbs.clin_num) || undefined,
            wbs: wbs.wbs || undefined,
            source_type: wbs.source_type || undefined,
            resource_code: wbs.resource_code || undefined,
            resource_description: wbs.resource_description || undefined,
            resource_type: wbs.resource_type || undefined,
            rate: Number(wbs.rate) || undefined,
            hours_worked: Number(wbs.hours_worked) || undefined,
            units: Number(wbs.units) || undefined,
            cost: Number(wbs.cost) || undefined,
            base_cost: Number(wbs.base_cost) || undefined,
            direct_cost: Number(wbs.direct_cost) || undefined,
            total_price: Number(wbs.total_price) || undefined,
          }))
        );
      } catch (error) {
        toast.error(
          toastMessage(
            "There was an error uploading your file",
            (error as Error).message
          )
        );
      }
    })(file);
  };

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);

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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FilePlus2
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Upload ProPricer
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-2">
                      <p className="text-sm text-gray-500">
                        Make sure the file is in the correct format (.xlsx) and
                        contains the correct WBS (Work Breakdown Structure)
                        data.
                      </p>

                      <div className="flex flex-col gap-2">
                        {/* <label
                          htmlFor="file"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Upload ProPricer
                        </label> */}

                        <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
                          <span className="inline-block h-12 w-full rounded-md">
                            <input
                              type="file"
                              name="file"
                              id="file"
                              accept=".xlsx"
                              className="block h-full w-full rounded-md border-gray-300 pt-2 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:pt-3 sm:text-sm"
                            />
                          </span>

                          <button
                            type="button"
                            onClick={submitFileUpload}
                            className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Done
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default ModalUploadProjectProPricer;
