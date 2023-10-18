import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { Award, Download, DownloadIcon } from "lucide-react";
import { api } from "~/utils/api";
import type { view_project } from "~/types/view_project";

type ModalProps = {
  project: view_project;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalDownloadProPricerTemplate({
  project,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const createManyWBS = api.wbs.createMany.useMutation({
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Successfully downloaded template",
          "The template has been successfully downloaded."
        )
      );

      // Close modal
      closeModal();
    },
    onError: (error) => {
      toast.error(
        toastMessage(
          "There was an error downloading the template",
          "If you are having trouble downloading this template, please contact your system administrator."
        )
      );
      console.error(error);
    },
  });

  const fileDownload = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Get the download URL
    const downloadUrl = location.origin + "/pro-pricer-template.xlsx";

    // If no download URL is provided, show an error toast
    if (!downloadUrl) {
      toast.error(
        toastMessage(
          "Download link is not available",
          "If you are having trouble downloading a file, please contact your system administrator."
        )
      );
      return;
    }

    // Create an invisible anchor element for downloading
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    console.log(downloadUrl);

    // Set the download attribute with a suggested filename
    anchor.download = "pro_pricer_template.xlsx";

    anchor.click();
    closeModal();
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Download
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      ProPricer Template
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-2">
                      <p className="text-sm text-gray-500">
                        Click to download the excel ProPricer template. Note
                        that the first row is example data for format reference
                        only, remove before use.
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="mt-1 flex flex-col items-center gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={fileDownload}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <DownloadIcon className="mr-2 h-5 w-5" />
                            Download
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
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default ModalDownloadProPricerTemplate;
