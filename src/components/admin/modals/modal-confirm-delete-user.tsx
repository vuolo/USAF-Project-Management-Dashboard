import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";
import { AlertTriangle, UserX } from "lucide-react";
import { api } from "~/utils/api";
import { users } from "@prisma/client";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query";

type ModalProps = {
  user?: users;
  refetch: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalConfirmDeleteUser({ user, refetch, isOpen, setIsOpen }: ModalProps) {
  const router = useRouter();

  const removeUser = api.user.delete.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing User",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("User Removed", "The user was removed successfully.")
      );

      void refetch();
    },
  });

  const submitRemoveUser = () => {
    if (!user) return;

    removeUser.mutate({ id: user.id });
  };

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(
    (closeProject: boolean) => {
      setModalOpen(false);
      setIsOpen(false);

      if (closeProject) submitRemoveUser();
    },
    [setIsOpen, submitRemoveUser]
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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserX
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Are you sure you want to remove this user?
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-2">
                      <p className="text-sm text-gray-500">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => closeModal(true)}
                >
                  Delete User
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default ModalConfirmDeleteUser;
