import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import { useRouter } from "next/router";


type ModalProps = {
    project_id: number;
    isOpen: boolean;
    closeModal: () => void; 
};

export default function ConfirmGenerateClin({
    project_id,
    isOpen,
    closeModal
  }: ModalProps) {

  const router = useRouter();
    // Generate new CLINs based on WBS
  const generateClin = api.clin.generateClinFromWBS.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error generating CLIN entry's.",
          "There was an error fetching the WBS data and genertating the CLIN entry's. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "CLIN Entry's Generated.",
          "The WBS data was fetched and CLIN entry's generated successfully."
        )
      );

      router.reload();
    },
  });

    return (
        <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {
            closeModal();
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
                    <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Confirm CLIN Generation
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mt-2"> 
                          This will overwrite the current CLIN entries with auto generated ones based on the current WBS data. You will need to edit the type, scope, and cost estimate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                        generateClin.mutate({ project_id: project_id });
                        closeModal();
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={closeModal}
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