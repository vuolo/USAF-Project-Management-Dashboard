import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { ListOrdered } from "lucide-react";
import { format } from "date-fns";
import { api } from "~/utils/api";
import type { predecessor } from "~/types/predecessor";
import type { successor } from "~/types/successor";
import type { milestone } from "~/types/milestone";
import type { view_project } from "~/types/view_project";

type ModalProps = {
  project: view_project;
  predecessors?: predecessor[];
  successors?: successor[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectDependencies({
  project,
  predecessors,
  successors,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();
  const { data: milestones } = api.milestone.getSchedules.useQuery({
    project_id: project.id,
  });
  const { data: projects } = api.project.list_view.useQuery();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  // Add Predecessor:
  const [selectedAddPredecessorProject, set_selectedAddPredecessorProject] =
    useState<view_project>();
  const { data: addPredecessorSelectedProjectMilestones } =
    api.milestone.getSchedules.useQuery({
      project_id: selectedAddPredecessorProject?.id || -1,
    });
  const [
    selectedAddPredecessorSelectedProjectMilestone,
    set_selectedAddPredecessorSelectedProjectMilestone,
  ] = useState<milestone>();
  const [
    selectedAddPredecessorCurrentProjectMilestone,
    set_selectedAddPredecessorCurrentProjectMilestone,
  ] = useState<milestone>();
  // Remove Predecessor:
  const [selectedRemovePredecessor, set_selectedRemovePredecessor] =
    useState<predecessor>();
  // Add Successor:
  const [
    selectedAddSuccessorCurrentProjectMilestone,
    set_selectedAddSuccessorCurrentProjectMilestone,
  ] = useState<milestone>();
  const [selectedAddSuccessorProject, set_selectedAddSuccessorProject] =
    useState<view_project>();
  const { data: addSuccessorSelectedProjectMilestones } =
    api.milestone.getSchedules.useQuery({
      project_id: selectedAddSuccessorProject?.id || -1,
    });
  const [
    selectedAddSuccessorSelectedProjectMilestone,
    set_selectedAddSuccessorSelectedProjectMilestone,
  ] = useState<milestone>();
  // Remove Successor:
  const [selectedRemoveSuccessor, set_selectedRemoveSuccessor] =
    useState<successor>();

  const addPredecessor = api.dependency.addDependency.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding Predecessor",
          "There was an error adding the predecessor. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Predecessor Added",
          "The predecessor was successfully added."
        )
      );

      // Refresh the UI data
      router.reload(); // Note: This is a hacky way to refresh the data, but it works for now. We should find a better way to do this.

      // Reset the "Add Predecessor" modal states
      set_selectedAddPredecessorProject(undefined);
      set_selectedAddPredecessorSelectedProjectMilestone(undefined);
      set_selectedAddPredecessorCurrentProjectMilestone(undefined);
    },
  });

  const submitAddPredecessor = useCallback(() => {
    if (
      !selectedAddPredecessorProject ||
      !selectedAddPredecessorCurrentProjectMilestone ||
      !selectedAddPredecessorSelectedProjectMilestone
    ) {
      toast.error(
        toastMessage(
          "Error Adding Predecessor",
          "Make sure you have selected a project, a milestone from the current project, and a milestone from the selected project."
        )
      );
      return;
    }

    addPredecessor.mutate({
      predecessor_project: selectedAddPredecessorProject.id,
      predecessor_milestone: selectedAddPredecessorSelectedProjectMilestone.ID,
      successor_project: project.id,
      successor_milestone: selectedAddPredecessorCurrentProjectMilestone.ID,
    });
  }, [
    addPredecessor,
    project,
    selectedAddPredecessorCurrentProjectMilestone,
    selectedAddPredecessorProject,
    selectedAddPredecessorSelectedProjectMilestone,
  ]);

  const removePredecessor = api.dependency.removeDependency.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Removing Predecessor",
          "There was an error removing the predecessor. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Predecessor Removed",
          "The predecessor was successfully removed."
        )
      );

      // Refresh the UI data
      router.reload(); // Note: This is a hacky way to refresh the data, but it works for now. We should find a better way to do this.

      // Reset the "Remove Predecessor" modal state
      set_selectedRemovePredecessor(undefined);
    },
  });

  const submitRemovePredecessor = useCallback(() => {
    if (!selectedRemovePredecessor) {
      toast.error(
        toastMessage(
          "Error Removing Predecessor",
          "There was an error removing the predecessor. Please try again."
        )
      );
      return;
    }

    removePredecessor.mutate({
      predecessor_project: selectedRemovePredecessor.predecessor_project,
      predecessor_milestone: selectedRemovePredecessor.predecessor_milestone,
      successor_project: project.id,
      successor_milestone: selectedRemovePredecessor.successor_milestone,
    });
  }, [project, selectedRemovePredecessor, removePredecessor]);

  const addSuccessor = api.dependency.addDependency.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding Successor",
          "There was an error adding the successor. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage("Successor Added", "The successor was successfully added.")
      );

      // Refresh the UI data
      router.reload(); // Note: This is a hacky way to refresh the data, but it works for now. We should find a better way to do this.

      // Reset the "Add Successor" modal states
      set_selectedAddSuccessorProject(undefined);
      set_selectedAddSuccessorSelectedProjectMilestone(undefined);
      set_selectedAddSuccessorCurrentProjectMilestone(undefined);
    },
  });

  const submitAddSuccessor = useCallback(() => {
    if (
      !selectedAddSuccessorCurrentProjectMilestone ||
      !selectedAddSuccessorProject ||
      !selectedAddSuccessorSelectedProjectMilestone
    ) {
      toast.error(
        toastMessage(
          "Error Adding Successor",
          "Make sure you have selected a project, a milestone from the current project, and a milestone from the selected project."
        )
      );
      return;
    }

    addSuccessor.mutate({
      predecessor_project: project.id,
      predecessor_milestone: selectedAddSuccessorCurrentProjectMilestone.ID,
      successor_project: selectedAddSuccessorProject.id,
      successor_milestone: selectedAddSuccessorSelectedProjectMilestone.ID,
    });
  }, [
    addSuccessor,
    project,
    selectedAddSuccessorCurrentProjectMilestone,
    selectedAddSuccessorProject,
    selectedAddSuccessorSelectedProjectMilestone,
  ]);

  const removeSuccessor = api.dependency.removeDependency.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Removing Successor",
          "There was an error removing the successor. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage(
          "Successor Removed",
          "The successor was successfully removed."
        )
      );

      // Refresh the UI data
      router.reload(); // Note: This is a hacky way to refresh the data, but it works for now. We should find a better way to do this.

      // Reset the "Remove Successor" modal state
      set_selectedRemoveSuccessor(undefined);
    },
  });

  const submitRemoveSuccessor = useCallback(() => {
    if (!selectedRemoveSuccessor) {
      toast.error(
        toastMessage(
          "Error Removing Successor",
          "No successor was selected. Please try again."
        )
      );
      return;
    }

    removeSuccessor.mutate({
      predecessor_project: project.id,
      predecessor_milestone: selectedRemoveSuccessor.predecessor_milestone,
      successor_project: selectedRemoveSuccessor.successor_project,
      successor_milestone: selectedRemoveSuccessor.successor_milestone,
    });
  }, [project, selectedRemoveSuccessor, removeSuccessor]);

  const resetModalStates = useCallback(() => {
    set_selectedAddPredecessorProject(undefined);
    // set_addPredecessorSelectedProjectMilestones([]);
    set_selectedAddPredecessorSelectedProjectMilestone(undefined);
    set_selectedAddPredecessorCurrentProjectMilestone(undefined);

    set_selectedRemovePredecessor(undefined);

    set_selectedAddSuccessorCurrentProjectMilestone(undefined);
    set_selectedAddSuccessorProject(undefined);
    // set_addSuccessorSelectedProjectMilestones([]);
    set_selectedAddSuccessorSelectedProjectMilestone(undefined);

    set_selectedRemoveSuccessor(undefined);
  }, []);

  const openModal = useCallback(() => {
    resetModalStates();
    setModalOpen(true);
  }, [resetModalStates, setModalOpen]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsOpen(false);

    // Reset the input (use a timeout to wait for the modal close transition to finish)
    setTimeout(() => {
      resetModalStates();
      setIsOpen(false);
    }, 500);
  }, [resetModalStates, setIsOpen]);

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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ListOrdered
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mr-2 mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Edit Project Dependencies
                    </Dialog.Title>
                    {!milestones || milestones.length === 0 ? (
                      <div className="mt-2 flex min-w-full flex-col gap-2">
                        <p className="text-sm text-gray-500">
                          This project has no milestones. Please add milestones
                          to this project before adding dependencies.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Top Section */}
                        <div className="mt-2 flex flex-col gap-4 md:flex-row md:gap-16">
                          {/* Add Predecessor [Left] */}
                          <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                            <h1 className="mx-auto font-medium underline">
                              Add Predecessor
                            </h1>

                            {/* Predecessor Project */}
                            <form
                              onSubmit={(e) => e.preventDefault()}
                              className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                            >
                              <label
                                className="sm:text-sm"
                                htmlFor="add-predecessor-project-select"
                              >
                                Predecessor Project
                              </label>
                              <select
                                id="add-predecessor-project-select"
                                name="add-predecessor-project-select"
                                className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                value={selectedAddPredecessorProject?.id}
                                onChange={(e) => {
                                  const id = parseInt(e.target.value);
                                  const project = projects?.find(
                                    (project) => project.id === id
                                  );
                                  set_selectedAddPredecessorProject(project);
                                }}
                              >
                                <option value="">Select a Project</option>
                                {projects?.map((project) => (
                                  <option key={project.id} value={project.id}>
                                    {project.project_name}
                                  </option>
                                ))}
                              </select>
                            </form>

                            {/* Predecessor Milestone */}
                            {selectedAddPredecessorProject && (
                              <form
                                onSubmit={(e) => e.preventDefault()}
                                className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                              >
                                <label
                                  className="sm:text-sm"
                                  htmlFor="add-predecessor-project-milestone-select"
                                >
                                  Predecessor Milestone
                                </label>
                                <select
                                  id="add-predecessor-project-milestone-select"
                                  name="add-predecessor-project-milestone-select"
                                  className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                  value={
                                    selectedAddPredecessorSelectedProjectMilestone?.ID
                                  }
                                  onChange={(e) => {
                                    const id = parseInt(e.target.value);
                                    const milestone =
                                      addPredecessorSelectedProjectMilestones?.find(
                                        (milestone) => milestone.ID === id
                                      );
                                    set_selectedAddPredecessorSelectedProjectMilestone(
                                      milestone
                                    );
                                  }}
                                >
                                  <option value="">
                                    Select a Predecessor Milestone
                                  </option>
                                  {addPredecessorSelectedProjectMilestones?.map(
                                    (milestone) => (
                                      <option
                                        key={milestone.ID}
                                        value={milestone.ID}
                                      >
                                        {`${milestone.Name}: ${
                                          milestone.ProjectedStart
                                            ? format(
                                                milestone.ProjectedStart,
                                                "MM/dd/yyyy"
                                              )
                                            : "N/A"
                                        } - ${
                                          milestone.ProjectedEnd
                                            ? format(
                                                milestone.ProjectedEnd,
                                                "MM/dd/yyyy"
                                              )
                                            : "N/A"
                                        }`}
                                      </option>
                                    )
                                  )}
                                </select>
                              </form>
                            )}

                            {/* Successor Milestone From This Project */}
                            {selectedAddPredecessorProject &&
                              selectedAddPredecessorSelectedProjectMilestone && (
                                <form
                                  onSubmit={(e) => e.preventDefault()}
                                  className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                                >
                                  <label
                                    className="sm:text-sm"
                                    htmlFor="add-predecessor-current-project-milestone-select"
                                  >
                                    Successor Milestone From This Project
                                  </label>
                                  <select
                                    id="add-predecessor-current-project-milestone-select"
                                    name="add-predecessor-current-project-milestone-select"
                                    className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                    value={
                                      selectedAddPredecessorCurrentProjectMilestone?.ID
                                    }
                                    onChange={(e) => {
                                      const id = parseInt(e.target.value);
                                      const milestone = milestones?.find(
                                        (milestone) => milestone.ID === id
                                      );
                                      set_selectedAddPredecessorCurrentProjectMilestone(
                                        milestone
                                      );
                                    }}
                                  >
                                    <option value="">
                                      Select a Successor Milestone
                                    </option>
                                    {milestones?.map((milestone) => (
                                      <option
                                        key={milestone.ID}
                                        value={milestone.ID}
                                      >
                                        {`${milestone.Name}: ${
                                          milestone.ProjectedStart
                                            ? format(
                                                milestone.ProjectedStart,
                                                "MM/dd/yyyy"
                                              )
                                            : "N/A"
                                        } - ${
                                          milestone.ProjectedEnd
                                            ? format(
                                                milestone.ProjectedEnd,
                                                "MM/dd/yyyy"
                                              )
                                            : "N/A"
                                        }`}
                                      </option>
                                    ))}
                                  </select>
                                </form>
                              )}

                            {/* Add Predecessor Button */}
                            {selectedAddPredecessorProject &&
                              selectedAddPredecessorSelectedProjectMilestone &&
                              selectedAddPredecessorCurrentProjectMilestone && (
                                <button
                                  onClick={submitAddPredecessor}
                                  type="submit"
                                  className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                                >
                                  Add Predecessor
                                </button>
                              )}
                          </div>

                          {/* Remove Predecessor [Right] */}
                          <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                            <h1 className="mx-auto font-medium underline">
                              Remove Predecessor
                            </h1>

                            {/* Predecessor */}
                            <form
                              onSubmit={(e) => e.preventDefault()}
                              className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                            >
                              <label
                                className="sm:text-sm"
                                htmlFor="remove-predecessor-select"
                              >
                                Predecessor
                              </label>
                              <select
                                id="remove-predecessor-select"
                                name="remove-predecessor-select"
                                className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                value={`${
                                  selectedRemovePredecessor?.predecessor_project ??
                                  ""
                                }_${
                                  selectedRemovePredecessor?.predecessor_milestone ??
                                  ""
                                }_${
                                  selectedRemovePredecessor?.successor_milestone ??
                                  ""
                                }`}
                                onChange={(e) => {
                                  set_selectedRemovePredecessor(
                                    predecessors?.find(
                                      (predecessor) =>
                                        `${predecessor.predecessor_project}_${predecessor.predecessor_milestone}_${predecessor.successor_milestone}` ===
                                        e.target.value
                                    )
                                  );
                                }}
                              >
                                <option value="">Select a Predecessor</option>
                                {predecessors?.map((predecessor) => (
                                  <option
                                    key={`${predecessor.predecessor_project}_${predecessor.predecessor_milestone}_${predecessor.successor_milestone}`}
                                    value={`${predecessor.predecessor_project}_${predecessor.predecessor_milestone}_${predecessor.successor_milestone}`}
                                  >
                                    {`${predecessor.predecessor_name}: ${predecessor.predecessor_task_name} \u2192 ${predecessor.dep_proj_name}: ${predecessor.successor_task_name}`}
                                  </option>
                                ))}
                              </select>
                            </form>

                            {/* Remove Predecessor Button */}
                            {selectedRemovePredecessor && (
                              <button
                                onClick={submitRemovePredecessor}
                                type="submit"
                                className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                              >
                                Remove Predecessor
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-8 w-full border-t border-gray-300" />

                        {/* Bottom Section */}
                        <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-16">
                          {/* Add Successor [Left] */}
                          <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                            <h1 className="mx-auto font-medium underline">
                              Add Successor
                            </h1>

                            {/* Predecessor Milestone From This Project */}
                            <form
                              onSubmit={(e) => e.preventDefault()}
                              className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                            >
                              <label
                                className="sm:text-sm"
                                htmlFor="add-successor-current-project-predecessor-milestone-select"
                              >
                                Predecessor Milestone From This Project
                              </label>
                              <select
                                id="add-successor-current-project-predecessor-milestone-select"
                                name="add-successor-current-project-predecessor-milestone-select"
                                className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                value={
                                  selectedAddSuccessorCurrentProjectMilestone?.ID
                                }
                                onChange={(e) => {
                                  set_selectedAddSuccessorCurrentProjectMilestone(
                                    milestones?.find(
                                      (milestone) =>
                                        milestone.ID ===
                                        parseInt(e.target.value)
                                    )
                                  );
                                }}
                              >
                                <option value="">
                                  Select a Predecessor Milestone
                                </option>
                                {milestones?.map((milestone) => (
                                  <option
                                    key={milestone.ID}
                                    value={milestone.ID}
                                  >
                                    {`${milestone.Name}: ${
                                      milestone.ProjectedStart
                                        ? format(
                                            milestone.ProjectedStart,
                                            "MM/dd/yyyy"
                                          )
                                        : "..."
                                    } - ${
                                      milestone.ProjectedEnd
                                        ? format(
                                            milestone.ProjectedEnd,
                                            "MM/dd/yyyy"
                                          )
                                        : "..."
                                    }`}
                                  </option>
                                ))}
                              </select>
                            </form>

                            {/* Successor Project */}
                            {selectedAddSuccessorCurrentProjectMilestone && (
                              <form
                                onSubmit={(e) => e.preventDefault()}
                                className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                              >
                                <label
                                  className="sm:text-sm"
                                  htmlFor="add-successor-successor-project-select"
                                >
                                  Successor Project
                                </label>
                                <select
                                  id="add-successor-successor-project-select"
                                  name="add-successor-successor-project-select"
                                  className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                  value={selectedAddSuccessorProject?.id}
                                  onChange={(e) => {
                                    set_selectedAddSuccessorProject(
                                      projects?.find(
                                        (project) =>
                                          project.id ===
                                          parseInt(e.target.value)
                                      )
                                    );
                                  }}
                                >
                                  <option value="">
                                    Select a Successor Project
                                  </option>
                                  {projects?.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.project_name}
                                    </option>
                                  ))}
                                </select>
                              </form>
                            )}

                            {/* Successor Milestone */}
                            {selectedAddSuccessorCurrentProjectMilestone &&
                              selectedAddSuccessorProject && (
                                <form
                                  onSubmit={(e) => e.preventDefault()}
                                  className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                                >
                                  <label
                                    className="sm:text-sm"
                                    htmlFor="add-successor-successor-milestone-select"
                                  >
                                    Successor Milestone
                                  </label>
                                  <select
                                    id="add-successor-successor-milestone-select"
                                    name="add-successor-successor-milestone-select"
                                    className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                    value={
                                      selectedAddSuccessorSelectedProjectMilestone?.ID
                                    }
                                    onChange={(e) => {
                                      set_selectedAddSuccessorSelectedProjectMilestone(
                                        addSuccessorSelectedProjectMilestones?.find(
                                          (milestone) =>
                                            milestone.ID ===
                                            parseInt(e.target.value)
                                        )
                                      );
                                    }}
                                  >
                                    <option value="">
                                      Select a Successor Milestone
                                    </option>
                                    {addSuccessorSelectedProjectMilestones?.map(
                                      (milestone) => (
                                        <option
                                          key={milestone.ID}
                                          value={milestone.ID}
                                        >
                                          {`${milestone.Name}: ${
                                            milestone.ProjectedStart
                                              ? format(
                                                  milestone.ProjectedStart,
                                                  "MM/dd/yyyy"
                                                )
                                              : "N/A"
                                          } - ${
                                            milestone.ProjectedEnd
                                              ? format(
                                                  milestone.ProjectedEnd,
                                                  "MM/dd/yyyy"
                                                )
                                              : "N/A"
                                          }`}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </form>
                              )}

                            {/* Add Successor Button */}
                            {selectedAddSuccessorCurrentProjectMilestone &&
                              selectedAddSuccessorProject &&
                              selectedAddSuccessorSelectedProjectMilestone && (
                                <button
                                  onClick={submitAddSuccessor}
                                  type="submit"
                                  className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                                >
                                  Add Successor
                                </button>
                              )}
                          </div>

                          {/* Remove Successor [Right] */}
                          <div className="mt-2 flex min-w-full flex-col gap-2 sm:min-w-[40%]">
                            <h1 className="mx-auto font-medium underline">
                              Remove Successor
                            </h1>

                            {/* Successor */}
                            <form
                              onSubmit={(e) => e.preventDefault()}
                              className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                            >
                              <label
                                className="sm:text-sm"
                                htmlFor="remove-successor-select"
                              >
                                Successor
                              </label>
                              <select
                                id="remove-successor-select"
                                name="remove-successor-select"
                                className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                                value={`${
                                  selectedRemoveSuccessor?.predecessor_milestone ??
                                  ""
                                }_${
                                  selectedRemoveSuccessor?.successor_project ??
                                  ""
                                }_${
                                  selectedRemoveSuccessor?.successor_milestone ??
                                  ""
                                }`}
                                onChange={(e) => {
                                  set_selectedRemoveSuccessor(
                                    successors?.find(
                                      (successor) =>
                                        `${successor.predecessor_milestone}_${successor.successor_project}_${successor.successor_milestone}` ===
                                        e.target.value
                                    )
                                  );
                                }}
                              >
                                <option value="">Select a Successor</option>
                                {successors?.map((successor) => (
                                  <option
                                    key={`${successor.predecessor_milestone}_${successor.successor_project}_${successor.successor_milestone}`}
                                    value={`${successor.predecessor_milestone}_${successor.successor_project}_${successor.successor_milestone}`}
                                  >
                                    {`${successor.predecessor_name}: ${successor.predecessor_task_name} \u2192 ${successor.succ_proj_name}: ${successor.successor_task_name}`}
                                  </option>
                                ))}
                              </select>
                            </form>

                            {/* Remove Successor Button */}
                            {selectedRemoveSuccessor && (
                              <button
                                onClick={submitRemoveSuccessor}
                                type="submit"
                                className="mt-2 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                              >
                                Remove Successor
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
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

export default ModalEditProjectDependencies;
