import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { CalendarClock, PlusCircle, Trash2 } from "lucide-react";
import {
  convertDateToDayValue,
  convertDayValueToDate,
  isInvalidDate,
} from "~/utils/date";
import { api } from "~/utils/api";
import DatePicker, {
  type DayValue,
} from "@hassanmojab/react-modern-calendar-datepicker";
import type { view_project } from "~/types/view_project";
import type { milestone, NewMilestone } from "~/types/milestone";
import type { milestone_using_day_values } from "~/types/milestone_using_day_values";
import { classNames, generateAlphaId } from "~/utils/misc";

type ModalProps = {
  project: view_project;
  milestoneSchedules?: milestone[] | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectSchedule({
  project,
  milestoneSchedules,
  isOpen,
  setIsOpen,
}: ModalProps) {
  const router = useRouter();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [editableMilestoneSchedules, setEditableMilestoneSchedules] = useState<
    milestone_using_day_values[]
  >([]);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Keep track of new milestones
  const [newMilestones, setNewMilestones] = useState<NewMilestone[]>([]);
  useEffect(() => {
    if (!modalOpen) setNewMilestones([]);
  }, [modalOpen]);

  useEffect(() => {
    // add newMilestones to editableMilestoneSchedules
    console.log("newMilestones", newMilestones);

    if (newMilestones.length === 0) return;
    setEditableMilestoneSchedules((prev) => [
      ...prev,
      ...(newMilestones
        // Filter out milestones that already exist
        .filter((m) => !prev.find((m2) => m2.alphaId === m.alphaId))
        .map((m) => ({
          // Convert each date to a DayValue object (this is used by the date picker)
          ...m,
          ProjectedStart: isInvalidDate(m.ProjectedStart)
            ? null
            : convertDateToDayValue(m.ProjectedStart),
          ProjectedEnd: isInvalidDate(m.ProjectedEnd)
            ? null
            : convertDateToDayValue(m.ProjectedEnd),
          ActualStart: isInvalidDate(m.ActualStart)
            ? null
            : convertDateToDayValue(m.ActualStart),
          ActualEnd: isInvalidDate(m.ActualEnd)
            ? null
            : convertDateToDayValue(m.ActualEnd),
        })) as milestone_using_day_values[]),
    ]);
  }, [newMilestones]);

  // Listen for changes in milestoneSchedules, and update edit state (the edit state is used to render the table on the modal)
  useEffect(() => {
    if (!milestoneSchedules || editableMilestoneSchedules.length > 0) return;

    setEditableMilestoneSchedules(
      milestoneSchedules.map((m) =>
        // Convert each date to a DayValue object (this is used by the date picker)
        ({
          ...m,
          ProjectedStart: isInvalidDate(m.ProjectedStart)
            ? null
            : convertDateToDayValue(m.ProjectedStart),
          ProjectedEnd: isInvalidDate(m.ProjectedEnd)
            ? null
            : convertDateToDayValue(m.ProjectedEnd),
          ActualStart: isInvalidDate(m.ActualStart)
            ? null
            : convertDateToDayValue(m.ActualStart),
          ActualEnd: isInvalidDate(m.ActualEnd)
            ? null
            : convertDateToDayValue(m.ActualEnd),
        })
      ) as milestone_using_day_values[]
    );
  }, [milestoneSchedules, editableMilestoneSchedules.length, newMilestones]);

  const submitAddMilestoneSchedule = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); // add a day

    setNewMilestones((prev) => [
      ...prev,
      {
        alphaId: generateAlphaId(prev.length), // generate a new alphaId based on current newMilestones. It should be: "A", "B", "C", ... "Z", "AA", "AB", "AC", ... "AZ", "BA", "BB", ...
        project_id: project.id,
        Name: "",
        Duration: 0,
        ProjectedStart: today,
        ProjectedEnd: tomorrow,
        ActualStart: undefined,
        ActualEnd: undefined,
        Predecessors: "",
        Predecessors_Name: "",
      },
    ]);
  }, [project]);

  const deleteMilestoneSchedule =
    api.milestone.deleteMilestoneSchedule.useMutation({
      onError: (error) => {
        toast.error(
          toastMessage(
            "Error Deleting Milestone Schedule",
            "There was an error deleting the milestone schedule. Please try again."
          )
        );
        console.error(error);
      },
      onSuccess: () => {
        toast.success(
          toastMessage(
            "Milestone Schedule Deleted",
            "The milestone schedule has been deleted."
          )
        );

        // Update UI to reflect new data
        // TODO: prevent the page from reloading, and update the UI to reflect the new data
        router.reload(); // For now, just reload the page instead of updating the UI (this is a bit hacky, but it works for now)
      },
    });

  const removeAssociatedMilestoneDependencies =
    api.dependency.removeAllAssociatedDependencies.useMutation({
      onError: (error) => {
        toast.error(
          toastMessage(
            "Error Removing Associated Dependencies",
            "There was an error removing the associated dependencies. Please try again."
          )
        );
        console.error(error);
      },
      onSuccess: () => {
        toast.success(
          toastMessage(
            "Associated Dependencies Removed",
            "The associated dependencies have been removed."
          )
        );
      },
    });

  const submitDeleteMilestoneSchedule = useCallback(
    (milestoneScheduleID?: number | string) => {
      if (!milestoneScheduleID) return;
      if (typeof milestoneScheduleID === "string") {
        // Delete new milestone
        setNewMilestones((prev) =>
          prev.filter((m) => m.alphaId !== milestoneScheduleID)
        );
        return;
      }
      deleteMilestoneSchedule.mutate({ milestone_id: milestoneScheduleID });

      // Delete all associated milestone dependencies
      removeAssociatedMilestoneDependencies.mutate({
        milestone_id: milestoneScheduleID,
      });
    },
    [deleteMilestoneSchedule, removeAssociatedMilestoneDependencies]
  );

  const addDependency = api.dependency.addDependency.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding Dependency",
          "There was an error adding the dependency. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage("Dependency Added", "The dependency has been added.")
      );
    },
  });

  const bulkAddMilestones = api.milestone.bulkAddMilestones.useMutation({
    onError: (error) => {
      toast.error(
        toastMessage(
          "Error Adding Milestones",
          "There was an error adding the milestones. Please try again."
        )
      );
      console.error(error);
    },
    onSuccess: () => {
      toast.success(
        toastMessage("Milestones Added", "The milestones have been added.")
      );
    },
  });

  const updateMilestoneSchedule =
    api.milestone.updateMilestoneSchedule.useMutation({
      onError: (error) => {
        toast.error(
          toastMessage(
            "Error Updating Milestone Schedule",
            "There was an error updating the milestone schedule. Please try again."
          )
        );
        console.error(error);
      },
      onSuccess: () => {
        toast.success(
          toastMessage(
            "Milestone Schedule Updated",
            "The milestone schedule has been updated."
          )
        );
      },
    });

  const submitUpdateMilestoneSchedule = useCallback(() => {
    if (!milestoneSchedules) return;

    // Convert each DayValue to a Date (this is used by the database)
    editableMilestoneSchedules.forEach((m, mIdx) => {
      // Only update if the milestone has been updated
      if (
        !m.alphaId &&
        (m.hasBeenUpdated || m.Name != milestoneSchedules[mIdx]?.Name)
      )
        updateMilestoneSchedule.mutate({
          milestone_id: m.ID,
          project_id: m.project_id,
          task_name: m.Name,
          projected_start: m.ProjectedStart
            ? convertDayValueToDate(m.ProjectedStart, 1)
            : new Date("December 31, 1969"),
          projected_end: m.ProjectedEnd
            ? convertDayValueToDate(m.ProjectedEnd, 1)
            : new Date("December 31, 1969"),
          actual_start: m.ActualStart
            ? convertDayValueToDate(m.ActualStart, 1)
            : new Date("December 31, 1969"),
          actual_end: m.ActualEnd
            ? convertDayValueToDate(m.ActualEnd, 1)
            : new Date("December 31, 1969"),
        });

      // Update Predecessors
      if (
        !m.alphaId &&
        m.Predecessors != milestoneSchedules[mIdx]?.Predecessors
      ) {
        // Delete all associated milestone dependencies
        removeAssociatedMilestoneDependencies.mutate({
          milestone_id: m.ID,
        });

        // Add new milestone dependencies
        m.Predecessors.split(",").forEach((p) => {
          const predecessor_milestone_str = p.trim();

          // Ensure the predecessor milestone is a number (id)
          const predecessor_milestone = Number(predecessor_milestone_str);
          if (isNaN(Number(predecessor_milestone))) return;

          addDependency.mutate({
            predecessor_project: m.project_id,
            predecessor_milestone,
            successor_project: m.project_id,
            successor_milestone: m.ID,
          });
        });
      }
    });

    // Bulk add new milestones
    bulkAddMilestones.mutate({
      milestones: editableMilestoneSchedules
        .filter((m) => m.alphaId)
        .map((m) => ({
          alphaId: m.alphaId,
          project_id: m.project_id,
          Name: m.Name,
          ProjectedStart: m.ProjectedStart
            ? convertDayValueToDate(m.ProjectedStart, 1)
            : new Date("December 31, 1969"),
          ProjectedEnd: m.ProjectedEnd
            ? convertDayValueToDate(m.ProjectedEnd, 1)
            : new Date("December 31, 1969"),
          ActualStart: m.ActualStart
            ? convertDayValueToDate(m.ActualStart, 1)
            : new Date("December 31, 1969"),
          ActualEnd: m.ActualEnd
            ? convertDayValueToDate(m.ActualEnd, 1)
            : new Date("December 31, 1969"),
          Predecessors: m.Predecessors,
          Predecessors_Name: m.Predecessors_Name,
        })),
    });
  }, [
    bulkAddMilestones,
    editableMilestoneSchedules,
    updateMilestoneSchedule,
    milestoneSchedules,
    removeAssociatedMilestoneDependencies,
    addDependency,
  ]);

  // Open modal
  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);
      setIsOpen(false);

      if (save) submitUpdateMilestoneSchedule();

      // Reset the edit state
      setTimeout(() => {
        setEditableMilestoneSchedules([]);
        // TODO: Refetch milestoneSchedules in the parent component
      }, 500);
    },
    [setIsOpen, submitUpdateMilestoneSchedule]
  );

  useEffect(() => {
    if (isOpen) openModal();
  }, [isOpen, openModal]);

  const updateDate = useCallback(
    (milestoneIndex: number, dateType: string, date: DayValue) => {
      setEditableMilestoneSchedules((prev) => {
        return prev.map((m, i) => {
          if (i === milestoneIndex) {
            return {
              ...m,
              [dateType]: date,
              hasBeenUpdated: true,
            };
          }

          return m;
        });
      });
    },
    []
  );

  const clearDate = useCallback((milestoneIndex: number, dateType: string) => {
    setEditableMilestoneSchedules((prev) => {
      return prev.map((m, i) => {
        if (i === milestoneIndex) {
          return {
            ...m,
            [dateType]: null,
            hasBeenUpdated: true,
          };
        }

        return m;
      });
    });
  }, []);

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={saveButtonRef}
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
            <div className="relative my-8 inline-block w-full max-w-full transform rounded-lg bg-white text-left align-middle shadow-xl transition-all">
              <div className="w-fit rounded-lg bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 2xl:w-full">
                <div className="flex items-start">
                  <div className="ml-4 mr-2 mt-3 w-full text-left">
                    <Dialog.Title
                      as="h3"
                      className="flex items-center gap-4 text-lg font-medium leading-6 text-gray-900"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <CalendarClock
                          className="h-6 w-6 text-blue-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span>Edit Project Schedule</span>
                    </Dialog.Title>

                    <div className="mx-auto flex flex-row items-center justify-center gap-2 pb-2 pt-4 text-left sm:px-6 sm:pt-6">
                      <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 p-2 text-center">
                        <div className="mt-2 flex flex-col items-center justify-center">
                          <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                              <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                {!editableMilestoneSchedules ? (
                                  <div className="flex h-64 items-center justify-center px-64">
                                    <div className="italic text-gray-500">
                                      Loading...
                                    </div>
                                  </div>
                                ) : (
                                  <table className="mx-auto min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th
                                          scope="col"
                                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                        >
                                          ID
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Name
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Projected Start
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Projected End
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Actual Start
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Actual End
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                        >
                                          Predecessors (IDs separated by a ,)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                      {editableMilestoneSchedules.map(
                                        (milestone, milestoneIdx) => (
                                          <tr
                                            key={
                                              milestone.ID || milestone.alphaId
                                            }
                                            className={
                                              milestoneIdx % 2 === 0
                                                ? undefined
                                                : "bg-gray-50"
                                            }
                                          >
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                              <div className="flex items-center justify-center gap-2">
                                                <span
                                                  className={classNames(
                                                    milestone.alphaId
                                                      ? "text-green-800"
                                                      : ""
                                                  )}
                                                >
                                                  {milestone.ID ||
                                                    milestone.alphaId}
                                                </span>
                                                <Trash2
                                                  onClick={() =>
                                                    submitDeleteMilestoneSchedule(
                                                      milestone.ID ||
                                                        milestone.alphaId
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <input
                                                type="text"
                                                className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="..."
                                                value={milestone.Name}
                                                onChange={(e) =>
                                                  setEditableMilestoneSchedules(
                                                    (prev) =>
                                                      prev.map(
                                                        (milestone, idx) =>
                                                          idx === milestoneIdx
                                                            ? {
                                                                ...milestone,
                                                                Name: e.target
                                                                  .value,
                                                              }
                                                            : milestone
                                                      )
                                                  )
                                                }
                                              />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="z-50 flex items-center gap-2">
                                                <DatePicker
                                                  value={
                                                    milestone.ProjectedStart
                                                  }
                                                  onChange={(date) =>
                                                    updateDate(
                                                      milestoneIdx,
                                                      "ProjectedStart",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />

                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      milestoneIdx,
                                                      "ProjectedStart"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={milestone.ProjectedEnd}
                                                  onChange={(date) =>
                                                    updateDate(
                                                      milestoneIdx,
                                                      "ProjectedEnd",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      milestoneIdx,
                                                      "ProjectedEnd"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={milestone.ActualStart}
                                                  onChange={(date) =>
                                                    updateDate(
                                                      milestoneIdx,
                                                      "ActualStart",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      milestoneIdx,
                                                      "ActualStart"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <div className="flex items-center gap-2">
                                                <DatePicker
                                                  value={milestone.ActualEnd}
                                                  onChange={(date) =>
                                                    updateDate(
                                                      milestoneIdx,
                                                      "ActualEnd",
                                                      date
                                                    )
                                                  }
                                                  inputPlaceholder="No Date"
                                                  inputClassName="w-[5.5rem] border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                  calendarClassName="z-50"
                                                />
                                                <Trash2
                                                  onClick={() =>
                                                    clearDate(
                                                      milestoneIdx,
                                                      "ActualEnd"
                                                    )
                                                  }
                                                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                                                />
                                              </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              <input
                                                type="text"
                                                className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="1,2,3..."
                                                value={milestone.Predecessors}
                                                onChange={(e) =>
                                                  setEditableMilestoneSchedules(
                                                    (prev) =>
                                                      prev.map(
                                                        (milestone, idx) => {
                                                          if (
                                                            idx === milestoneIdx
                                                          ) {
                                                            return {
                                                              ...milestone,
                                                              Predecessors:
                                                                e.target.value,
                                                            };
                                                          }
                                                          return milestone;
                                                        }
                                                      )
                                                  )
                                                }
                                              />
                                            </td>
                                          </tr>
                                        )
                                      )}
                                      <tr
                                        className={
                                          editableMilestoneSchedules.length %
                                            2 ===
                                          0
                                            ? undefined
                                            : "bg-gray-50"
                                        }
                                      >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                          <div className="flex items-center justify-center gap-2">
                                            <span>Add Milestone</span>
                                            <PlusCircle
                                              onClick={
                                                submitAddMilestoneSchedule
                                              }
                                              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-green-500"
                                            />
                                          </div>
                                        </td>
                                        <td />
                                        <td />
                                        <td />
                                        <td />
                                        <td />
                                        <td />
                                      </tr>
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

                {/* TODO: Upload Project Schedule */}

                <div className="mt-4 gap-2 rounded-lg bg-gray-50 px-4 py-3 sm:flex sm:px-6">
                  <button
                    ref={saveButtonRef}
                    type="button"
                    className="inline-flex w-fit justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(true)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="ml-3 mt-3 inline-flex w-fit justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => closeModal(false)}
                  >
                    Cancel
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

export default ModalEditProjectSchedule;
