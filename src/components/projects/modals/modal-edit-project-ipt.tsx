import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";
import { Users } from "lucide-react";
import { api } from "~/utils/api";
import type { military_job_titles, users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

type ModalProps = {
  project: view_project;
  ipt?: ipt_members[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectIPT({ project, ipt, isOpen, setIsOpen }: ModalProps) {
  const { data: militaryJobTitles } = api.mjt.getAll.useQuery();
  const { data: users } = api.user.getAllAdminsAndIptMembers.useQuery();
  const { data: contractorUsers } = api.user.getContractorUsers.useQuery({
    contractor_id: Number(project.contractor_id),
  });
  const { data: projectContractorUsers } =
    api.user.getProjectContractorUsers.useQuery({
      project_id: project.id,
    });

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAddIptJobTitle, set_selectedAddIptJobTitle] =
    useState<military_job_titles>();
  const [selectedAddIptUser, set_selectedAddIptUser] = useState<users>();
  const [selectedRemoveIptUser, set_selectedRemoveIptUser] =
    useState<ipt_members>();
  const [selectedAddContractorUser, set_selectedAddContractorUser] =
    useState<users>();
  const [selectedRemoveContractorUser, set_selectedRemoveContractorUser] =
    useState<users>();

  const addIptMember = api.user.addToUserProjectLink.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding IPT Member",
          "There was an error adding the IPT member to the project. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "IPT Member Added",
          "The IPT member was successfully added to the project."
        )
      );

      // Refresh the UI data
      if (selectedAddIptUser)
        ipt?.push({
          id: selectedAddIptUser?.id,
          mil_job_title: selectedAddIptJobTitle?.mil_job_title || "",
          user_name: selectedAddIptUser?.user_name || "",
        });
    },
  });

  const submitAddIptMember = useCallback(() => {
    if (!selectedAddIptJobTitle || !selectedAddIptUser) {
      toast.error(
        toastMessage(
          "Error Adding IPT Member",
          "Please select a job title and user to add to the IPT."
        )
      );
      return;
    }

    addIptMember.mutate({
      project_id: project.id,
      user_id: selectedAddIptUser.id,
      mil_job_title_id: selectedAddIptJobTitle.id,
    });
  }, [addIptMember, project, selectedAddIptJobTitle, selectedAddIptUser]);

  const removeIptMember = api.user.removeFromUserProjectLink.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Removing IPT Member",
          "There was an error removing the IPT member from the project. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "IPT Member Removed",
          "The IPT member was successfully removed from the project."
        )
      );

      // Refresh the UI data
      if (selectedRemoveIptUser)
        ipt?.splice(
          ipt.findIndex((user) => user.id === selectedRemoveIptUser.id),
          1
        );
    },
  });

  const submitRemoveIptMember = useCallback(() => {
    if (!selectedRemoveIptUser) {
      toast.error(
        toastMessage(
          "Error Removing IPT Member",
          "Please select a user to remove from the IPT."
        )
      );
      return;
    }

    removeIptMember.mutate({
      project_id: project.id,
      user_id: selectedRemoveIptUser.id,
    });
  }, [project, removeIptMember, selectedRemoveIptUser]);

  const addContractorUser = api.user.addToUserProjectLink.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding Contractor User",
          "There was an error adding the contractor user to the project. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Contractor User Added",
          "The contractor user was successfully added to the project."
        )
      );

      // Refresh the UI data
      if (selectedAddContractorUser)
        projectContractorUsers?.push(selectedAddContractorUser);
    },
  });

  const submitAddContractorUser = useCallback(() => {
    if (!selectedAddContractorUser) {
      toast.error(
        toastMessage(
          "Error Adding Contractor User",
          "Please select a user to add to the project."
        )
      );
      return;
    }

    addContractorUser.mutate({
      project_id: project.id,
      user_id: selectedAddContractorUser.id,
    });
  }, [addContractorUser, project, selectedAddContractorUser]);

  const removeContractorUser = api.user.removeFromUserProjectLink.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Removing Contractor User",
          "There was an error removing the contractor user from the project. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Contractor User Removed",
          "The contractor user was successfully removed from the project."
        )
      );

      // Refresh the UI data
      if (selectedRemoveContractorUser)
        projectContractorUsers?.splice(
          projectContractorUsers.findIndex(
            (user) => user.id === selectedRemoveContractorUser.id
          ),
          1
        );
    },
  });

  const submitRemoveContractorUser = useCallback(() => {
    if (!selectedRemoveContractorUser) {
      toast.error(
        toastMessage(
          "Error Removing Contractor User",
          "Please select a user to remove from the project."
        )
      );
      return;
    }

    removeContractorUser.mutate({
      project_id: project.id,
      user_id: selectedRemoveContractorUser.id,
    });
  }, [project, removeContractorUser, selectedRemoveContractorUser]);

  // Open modal
  const openModal = useCallback(() => {
    set_selectedAddIptJobTitle(militaryJobTitles?.[0] ?? undefined);
    set_selectedAddIptUser(users?.[0] ?? undefined);
    set_selectedRemoveIptUser(ipt?.[0] ?? undefined);
    set_selectedAddContractorUser(contractorUsers?.[0] ?? undefined);
    set_selectedRemoveContractorUser(projectContractorUsers?.[0] ?? undefined);
    setModalOpen(true);
  }, [
    militaryJobTitles,
    users,
    ipt,
    contractorUsers,
    projectContractorUsers,
    set_selectedAddIptJobTitle,
    set_selectedAddIptUser,
    set_selectedRemoveIptUser,
    set_selectedAddContractorUser,
    set_selectedRemoveContractorUser,
  ]);

  // Close modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsOpen(false);

    // Reset the input (use a timeout to wait for the modal close transition to finish)
    setTimeout(() => {
      set_selectedAddIptJobTitle(undefined);
      set_selectedAddIptUser(undefined);
      set_selectedRemoveIptUser(undefined);
      set_selectedAddContractorUser(undefined);
      set_selectedRemoveContractorUser(undefined);
      setIsOpen(false);
    }, 500);
  }, [
    set_selectedAddIptJobTitle,
    set_selectedAddIptUser,
    set_selectedRemoveIptUser,
    set_selectedAddContractorUser,
    set_selectedRemoveContractorUser,
    setIsOpen,
  ]);

  useEffect(() => {
    if (isOpen) openModal();
  }, [isOpen, openModal]);

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {
          closeModal();
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Users
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Edit IPT
                    </Dialog.Title>

                    {/* Top Section */}
                    <div className="flex flex-col gap-4 md:flex-row md:gap-16">
                      {/* Add IPT Member [Left] */}
                      <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                        <h1 className="mx-auto font-medium underline">
                          Add IPT Member
                        </h1>

                        {/* Job Title */}
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="add-ipt-member-job-title-select">
                            Job Title
                          </label>
                          <select
                            id="add-ipt-member-job-title-select"
                            name="add-ipt-member-job-title-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedAddIptJobTitle?.id}
                            onChange={(e) => {
                              set_selectedAddIptJobTitle(
                                militaryJobTitles?.find(
                                  (jobTitle) =>
                                    jobTitle.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {militaryJobTitles?.map((jobTitle) => (
                              <option key={jobTitle.id} value={jobTitle.id}>
                                {jobTitle.mil_job_title}
                              </option>
                            ))}
                          </select>
                        </form>

                        {/* User */}
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="add-ipt-member-user-select">
                            User
                          </label>
                          <select
                            id="add-ipt-member-user-select"
                            name="add-ipt-member-user-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedAddIptUser?.id}
                            onChange={(e) => {
                              set_selectedAddIptUser(
                                users?.find(
                                  (user) => user.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {users?.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.user_name}
                              </option>
                            ))}
                          </select>
                        </form>

                        {/* Add IPT Member Button */}
                        <button
                          onClick={submitAddIptMember}
                          type="submit"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                        >
                          Add IPT Member
                        </button>
                      </div>

                      {/* Remove IPT Member [Right] */}
                      <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                        <h1 className="mx-auto font-medium underline">
                          Remove IPT Member
                        </h1>

                        {/* User */}
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="remove-ipt-member-user-select">
                            User
                          </label>
                          <select
                            id="remove-ipt-member-user-select"
                            name="remove-ipt-member-user-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedRemoveIptUser?.id}
                            onChange={(e) => {
                              set_selectedRemoveIptUser(
                                ipt?.find(
                                  (ipt_member) =>
                                    ipt_member.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {ipt?.map((ipt_member) => (
                              <option key={ipt_member.id} value={ipt_member.id}>
                                {ipt_member.user_name}
                              </option>
                            ))}
                          </select>
                        </form>

                        {/* Remove IPT Member Button */}
                        <button
                          onClick={submitRemoveIptMember}
                          type="submit"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                        >
                          Remove IPT Member
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-8 w-full border-t border-gray-300" />

                    {/* Bottom Section */}
                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-16">
                      {/* Add Contractor [Left] */}
                      <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                        <h1 className="mx-auto font-medium underline">
                          Add Contractor User
                        </h1>

                        {/* Contractor User */}
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="add-contractor-user-select">
                            Contractor User
                          </label>
                          <select
                            id="add-contractor-user-select"
                            name="add-contractor-user-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedAddContractorUser?.id}
                            onChange={(e) => {
                              set_selectedAddContractorUser(
                                contractorUsers?.find(
                                  (contractorUser) =>
                                    contractorUser.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {contractorUsers?.map((contractorUser) => (
                              <option
                                key={contractorUser.id}
                                value={contractorUser.id}
                              >
                                {contractorUser.user_name}
                              </option>
                            ))}
                          </select>
                        </form>

                        {/* Add Contractor User Button */}
                        <button
                          onClick={submitAddContractorUser}
                          type="submit"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                        >
                          Add Contractor User
                        </button>
                      </div>

                      {/* Remove Contractor User [Right] */}
                      <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                        <h1 className="mx-auto font-medium underline">
                          Remove Contractor User
                        </h1>

                        {/* User */}
                        <form
                          onSubmit={(e) => e.preventDefault()}
                          className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                        >
                          <label htmlFor="remove-contractor-user-select">
                            Contractor User
                          </label>
                          <select
                            id="remove-contractor-user-select"
                            name="remove-contractor-user-select"
                            className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={selectedRemoveContractorUser?.id}
                            onChange={(e) => {
                              set_selectedRemoveContractorUser(
                                projectContractorUsers?.find(
                                  (contractorUser) =>
                                    contractorUser.id === Number(e.target.value)
                                )
                              );
                            }}
                          >
                            {projectContractorUsers?.map((contractorUser) => (
                              <option
                                key={contractorUser.id}
                                value={contractorUser.id}
                              >
                                {contractorUser.user_name}
                              </option>
                            ))}
                          </select>
                        </form>

                        {/* Remove Contractor User Button */}
                        <button
                          onClick={submitRemoveContractorUser}
                          type="submit"
                          className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                        >
                          Remove Contractor User
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => closeModal()}
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

export default ModalEditProjectIPT;
