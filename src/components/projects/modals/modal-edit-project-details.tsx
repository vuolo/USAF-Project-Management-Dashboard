import { Fragment, useCallback, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";
import { List } from "lucide-react";
import { api } from "~/utils/api";
import type { branches, contractor, requirement_types } from "@prisma/client";

type ModalProps = {
  project: view_project;
  contractors?: contractor[];
  branches?: branches[];
  requirementTypes?: requirement_types[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

function ModalEditProjectDetails({
  project,
  contractors,
  branches,
  requirementTypes,
  isOpen,
  setIsOpen,
}: ModalProps) {
  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, set_projectName] = useState("");
  const [contractNumber, set_contractNumber] = useState("");
  const [ccarNumber, set_ccarNumber] = useState("");
  const [selectedContractor, set_selectedContractor] = useState<contractor>();
  const [selectedBranch, set_selectedBranch] = useState<branches>();
  const [selectedRequirementType, set_selectedRequirementType] =
    useState<requirement_types>();
  const [capabilitySummary, set_capabilitySummary] = useState("");

  const updateContractNumber = api.contract.updateContractNumber.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error updating contract number.",
          "Please try again later or contact support."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "Contract number updated.",
          "The contract number has been updated."
        )
      );
    },
  });

  const updateProject = api.project.update.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error updating project.",
          "Please try again later or contact support."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage("Project updated.", "The project has been updated.")
      );

      // Update the project details in the UI
      project.project_name = projectName;
      project.contract_num = contractNumber;
      project.ccar_num = ccarNumber;
      project.contractor_id = selectedContractor?.id ?? project.contractor_id;
      project.contractor_name =
        selectedContractor?.contractor_name ?? project.contractor_name;
      project.branch_id = selectedBranch?.id ?? project.branch_id;
      project.branch = selectedBranch?.branch_name ?? project.branch;
      project.requirement_type_id =
        selectedRequirementType?.id ?? project.requirement_type_id;
      project.requirement_type =
        selectedRequirementType?.requirement_type ?? project.requirement_type;
      project.summary = capabilitySummary;
    },
  });

  const submitUpdateProject = useCallback(() => {
    if (
      typeof projectName !== "string" ||
      typeof contractNumber !== "string" ||
      typeof ccarNumber !== "string" ||
      typeof selectedContractor !== "object" ||
      typeof selectedBranch !== "object" ||
      typeof selectedRequirementType !== "object" ||
      typeof capabilitySummary !== "string"
    ) {
      toast.error(
        toastMessage(
          "Error updating project.",
          "Please enter valid project details."
        )
      );
      setIsOpen(false);
      return;
    }

    updateProject.mutate({
      id: project.id,
      project_name: projectName,
      project_type: project.project_type,
      ccar_num: ccarNumber,
      contractor_id: selectedContractor?.id ?? project.contractor_id,
      branch_id: selectedBranch?.id ?? project.branch_id,
      requirement_type_id:
        selectedRequirementType?.id ?? project.requirement_type_id,
      summary: capabilitySummary,
    });

    if (project.contract_num !== contractNumber && project.contract_award_id) {
      updateContractNumber.mutate({
        id: project.contract_award_id,
        contract_num: contractNumber,
      });
    }
  }, [
    projectName,
    contractNumber,
    ccarNumber,
    selectedContractor,
    selectedBranch,
    selectedRequirementType,
    capabilitySummary,
    updateContractNumber,
    updateProject,
    project,
    setIsOpen,
  ]);

  // Open modal
  const openModal = useCallback(() => {
    set_projectName(project.project_name || "");
    set_contractNumber(project.contract_num || "");
    set_ccarNumber(project.ccar_num || "");
    set_selectedContractor(
      contractors?.find((c) => Number(c.id) === Number(project.contractor_id))
    );
    set_selectedBranch(
      branches?.find((b) => Number(b.id) === Number(project.branch_id))
    );
    set_selectedRequirementType(
      requirementTypes?.find(
        (r) => Number(r.id) === Number(project.requirement_type_id)
      )
    );
    set_capabilitySummary(project.summary || "");
    setModalOpen(true);
  }, [project, contractors, branches, requirementTypes]);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);

      if (save) {
        if (
          typeof projectName !== "string" ||
          typeof contractNumber !== "string" ||
          typeof ccarNumber !== "string" ||
          typeof selectedContractor !== "object" ||
          typeof selectedBranch !== "object" ||
          typeof selectedRequirementType !== "object" ||
          typeof capabilitySummary !== "string"
        ) {
          toast.error(
            toastMessage(
              "Error updating project.",
              "Please enter valid project details."
            )
          );
          setIsOpen(false);
          return;
        }

        submitUpdateProject();
      }

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        set_projectName("");
        set_contractNumber("");
        set_ccarNumber("");
        set_selectedContractor(undefined);
        set_selectedBranch(undefined);
        set_selectedRequirementType(undefined);
        set_capabilitySummary("");
        setIsOpen(false);
      }, 500);
    },
    [
      projectName,
      contractNumber,
      ccarNumber,
      selectedContractor,
      selectedBranch,
      selectedRequirementType,
      capabilitySummary,
      submitUpdateProject,
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <List
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 mr-2 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Project Details
                    </Dialog.Title>
                    <div className="mt-2 flex min-w-full flex-col gap-2">
                      {/* Project Name */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="project-name">Project Name</label>
                        <input
                          type="text"
                          name="project-name"
                          id="project-name"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. 'Project 1'"
                          value={projectName}
                          onChange={(e) => {
                            set_projectName(e.target.value);
                          }}
                        />
                      </form>

                      {/* Contract Number */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="contractor-number">
                          Contract Number
                        </label>
                        <input
                          type="text"
                          name="contractor-number"
                          id="contractor-number"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. 'FA8620-22-Z-3333'"
                          value={contractNumber}
                          onChange={(e) => {
                            set_contractNumber(e.target.value);
                          }}
                        />
                      </form>

                      {/* CCAR Number */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="ccar-number">CCAR Number</label>
                        <input
                          type="text"
                          name="ccar-number"
                          id="ccar-number"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="e.g. '1500'"
                          value={ccarNumber}
                          onChange={(e) => {
                            set_ccarNumber(e.target.value);
                          }}
                        />
                      </form>

                      {/* Contractor */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="contractor-select">Contractor</label>
                        <select
                          id="contractor-select"
                          name="contractor-select"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          value={Number(selectedContractor?.id)}
                          onChange={(e) => {
                            set_selectedContractor(
                              contractors?.find(
                                (contractor) =>
                                  Number(contractor.id) ===
                                  Number(e.target.value)
                              )
                            );
                          }}
                        >
                          {/* <option value={0}>Select Contractor</option> */}
                          {contractors?.map((contractor) => (
                            <option
                              key={contractor.id}
                              value={Number(contractor.id)}
                            >
                              {contractor.contractor_name}
                            </option>
                          ))}
                        </select>
                      </form>

                      {/* Organization/Branch */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="organization-select">
                          Organization/Branch
                        </label>
                        <select
                          id="organization-select"
                          name="organization-select"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          value={Number(selectedBranch?.id)}
                          onChange={(e) => {
                            set_selectedBranch(
                              branches?.find(
                                (branch) =>
                                  Number(branch.id) === Number(e.target.value)
                              )
                            );
                          }}
                        >
                          {/* <option value={0}>Select Organization/Branch</option> */}
                          {branches?.map((branch) => (
                            <option key={branch.id} value={Number(branch.id)}>
                              {branch.branch_name}
                            </option>
                          ))}
                        </select>
                      </form>

                      {/* Requirement Type */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="requirement-type-select">
                          Requirement Type
                        </label>
                        <select
                          id="requirement-type-select"
                          name="requirement-type-select"
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          value={Number(selectedRequirementType?.id)}
                          onChange={(e) => {
                            set_selectedRequirementType(
                              requirementTypes?.find(
                                (requirementType) =>
                                  Number(requirementType.id) ===
                                  Number(e.target.value)
                              )
                            );
                          }}
                        >
                          {/* <option value={0}>Select Requirement Type</option> */}
                          {requirementTypes?.map((requirementType) => (
                            <option
                              key={requirementType.id}
                              value={Number(requirementType.id)}
                            >
                              {requirementType.requirement_type}
                            </option>
                          ))}
                        </select>
                      </form>

                      {/* Capability Summary */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          closeModal(true);
                        }}
                        className="mt-1 flex flex-col gap-1 rounded-md shadow-sm"
                      >
                        <label htmlFor="capability-summary">
                          Capability Summary
                        </label>
                        <textarea
                          id="capability-summary"
                          name="capability-summary"
                          rows={3}
                          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                          placeholder="This is a summary of the project's capability."
                          value={capabilitySummary}
                          onChange={(e) => {
                            set_capabilitySummary(e.target.value);
                          }}
                        />
                      </form>
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

export default ModalEditProjectDetails;
