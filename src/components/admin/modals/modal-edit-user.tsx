import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { List, UserCog } from "lucide-react";
import { api } from "~/utils/api";
import { contractor, users, users_user_role } from "@prisma/client";

type ModalProps = {
  user: users;
  contractors: contractor[];
  refetch: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditUserDetails({
  user,
  contractors,
  refetch,
  isOpen,
  setIsOpen,
}: ModalProps) {
  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, set_userName] = useState("");
  const [userRole, set_userRole] = useState<users_user_role>("IPT_Member");
  const [userEmail, set_userEmail] = useState("");
  const [selectedContractor, set_selectedContractor] = useState<contractor>();

  const updateUser = api.user.update.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error updating user.",
          "Please try again later or contact support."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage("User updated.", "The user has been updated.")
      );

      // Update the user details in the UI
      user.user_name = userName;
      user.user_role = userRole;
      user.user_email = userEmail;
      user.contractor_id = selectedContractor?.id ?? null;

      // Refetch data
      refetch();
    },
  });

  const submitUpdateUser = useCallback(() => {
    if (
      typeof userName !== "string" ||
      typeof userEmail !== "string" ||
      typeof userRole !== "string" ||
      typeof selectedContractor !== "object"
    ) {
      toast.error(
        toastMessage("Error updating user.", "Please enter valid user details.")
      );
      setIsOpen(false);
      return;
    }

    updateUser.mutate({
      id: user?.id,
      contractor_id: userRole === "Contractor" ? selectedContractor.id : 1,
      user_name: userName,
      user_email: userEmail,
      user_role: userRole,
    });
  }, [
    userName,
    userRole,
    user?.id,
    userEmail,
    updateUser,
    selectedContractor,
    setIsOpen,
  ]);

  // Open modal
  const openModal = useCallback(() => {
    set_userName(user.user_name || "");
    set_userRole(
      (user.user_role.replace("IPT Member", "IPT_Member") as users_user_role) ||
        ""
    );
    set_userEmail(user.user_email || "");
    set_selectedContractor(
      contractors.find(
        (contractor) => contractor.id === Number(user.contractor_id)
      ) || undefined
    );
    setModalOpen(true);
  }, [user, contractors]);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);

      if (save) {
        if (
          typeof userName !== "string" ||
          typeof userEmail !== "string" ||
          typeof userRole !== "string" ||
          typeof selectedContractor !== "object"
        ) {
          toast.error(
            toastMessage(
              "Error updating user.",
              "Please enter valid user details."
            )
          );
          setIsOpen(false);
          return;
        }

        submitUpdateUser();
      }

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        set_userName("");
        set_userRole("IPT_Member");
        set_userEmail("");
        set_selectedContractor(undefined);
        setIsOpen(false);
      }, 500);
    },
    [
      userName,
      userRole,
      userEmail,
      submitUpdateUser,
      selectedContractor,
      setIsOpen,
    ]
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
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserCog
                      className="ml-0.5 h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      User Details
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-2">
                      {/* Username */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="user-name">Username</label>
                        <input
                          type="text"
                          name="user-name"
                          id="user-name"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. 'SomeUsername'"
                          value={userName}
                          onChange={(e) => {
                            set_userName(e.target.value);
                          }}
                        />
                      </form>

                      {/* User Role */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="role-select">Role</label>
                        <select
                          id="role-select"
                          name="role-select"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          value={userRole}
                          onChange={(e) => {
                            set_userRole(e.target.value as users_user_role);
                          }}
                        >
                          {/* <option value={0}>Select User Role</option> */}
                          {Object.keys(users_user_role).map((role, roleIdx) => (
                            <option key={roleIdx} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </form>

                      {/* User Email */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="user_email">Email</label>
                        <input
                          type="text"
                          name="user-email"
                          id="user-email"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. 'user@example.com'"
                          value={userEmail}
                          onChange={(e) => {
                            set_userEmail(e.target.value);
                          }}
                        />
                      </form>

                      {/* Contractor */}
                      {userRole === "Contractor" && contractors && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                          }}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="contractor-select">Contractor</label>
                          <select
                            id="contractor-select"
                            name="contractor-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedContractor?.id}
                            onChange={(e) => {
                              set_selectedContractor(
                                contractors?.find(
                                  (contractor) =>
                                    contractor.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {/* <option value={0}>Select Contractor</option> */}
                            {contractors.map((contractor, contractorIdx) => (
                              <option key={contractorIdx} value={contractor.id}>
                                {contractor.contractor_name}
                              </option>
                            ))}
                          </select>
                        </form>
                      )}
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

export default ModalEditUserDetails;
