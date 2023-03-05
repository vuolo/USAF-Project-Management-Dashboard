import { Fragment, useCallback, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import type { view_project } from "~/types/view_project";
import { List } from "lucide-react";
import { api } from "~/utils/api";
import type { branches, contractor, requirement_types } from "@prisma/client";

function ProjectDetails({ project }: { project: view_project }) {
  const { data: contractors } = api.contractor.getAll.useQuery();
  const { data: branches } = api.branch.getAll.useQuery();
  const { data: requirementTypes } = api.requirement_type.getAll.useQuery();

  // Modal functionality (states)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInput_projectName, setModalInput_projectName] = useState("");
  const [modalInput_contractNumber, setModalInput_contractNumber] =
    useState("");
  const [modalInput_ccarNumber, setModalInput_ccarNumber] = useState("");
  const [modalInput_selectedContractor, setModalInput_selectedContractor] =
    useState<contractor>();
  const [modalInput_selectedBranch, setModalInput_selectedBranch] =
    useState<branches>();
  const [
    modalInput_selectedRequirementType,
    setModalInput_selectedRequirementType,
  ] = useState<requirement_types>();
  const [modalInput_capabilitySummary, setModalInput_capabilitySummary] =
    useState("");

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
      project.project_name = modalInput_projectName;
      project.contract_num = modalInput_contractNumber;
      project.ccar_num = modalInput_ccarNumber;
      project.contractor_id =
        modalInput_selectedContractor?.id ?? project.contractor_id;
      project.contractor_name =
        modalInput_selectedContractor?.contractor_name ??
        project.contractor_name;
      project.branch_id = modalInput_selectedBranch?.id ?? project.branch_id;
      project.branch = modalInput_selectedBranch?.branch_name ?? project.branch;
      project.requirement_type_id =
        modalInput_selectedRequirementType?.id ?? project.requirement_type_id;
      project.requirement_type =
        modalInput_selectedRequirementType?.requirement_type ??
        project.requirement_type;
      project.summary = modalInput_capabilitySummary;
    },
  });

  const submitUpdateProject = useCallback(() => {
    if (
      typeof modalInput_projectName !== "string" ||
      typeof modalInput_contractNumber !== "string" ||
      typeof modalInput_ccarNumber !== "string" ||
      typeof modalInput_selectedContractor !== "object" ||
      typeof modalInput_selectedBranch !== "object" ||
      typeof modalInput_selectedRequirementType !== "object" ||
      typeof modalInput_capabilitySummary !== "string"
    ) {
      toast.error(
        toastMessage(
          "Error updating project.",
          "Please enter valid project details."
        )
      );
      return;
    }

    updateProject.mutate({
      id: project.id,
      project_name: modalInput_projectName,
      project_type: project.project_type,
      ccar_num: modalInput_ccarNumber,
      contractor_id: modalInput_selectedContractor?.id ?? project.contractor_id,
      branch_id: modalInput_selectedBranch?.id ?? project.branch_id,
      requirement_type_id:
        modalInput_selectedRequirementType?.id ?? project.requirement_type_id,
      summary: modalInput_capabilitySummary,
    });

    if (project.contract_num !== modalInput_contractNumber) {
      updateContractNumber.mutate({
        id: project.contract_award_id,
        contract_num: modalInput_contractNumber,
      });
    }
  }, [
    modalInput_projectName,
    modalInput_contractNumber,
    modalInput_ccarNumber,
    modalInput_selectedContractor,
    modalInput_selectedBranch,
    modalInput_selectedRequirementType,
    modalInput_capabilitySummary,
    updateContractNumber,
    updateProject,
    project,
  ]);

  // Open modal
  const openModal = useCallback(() => {
    setModalInput_projectName(project.project_name);
    setModalInput_contractNumber(project.contract_num);
    setModalInput_ccarNumber(project.ccar_num);
    setModalInput_selectedContractor(
      contractors?.find((c) => Number(c.id) === Number(project.contractor_id))
    );
    setModalInput_selectedBranch(
      branches?.find((b) => Number(b.id) === Number(project.branch_id))
    );
    setModalInput_selectedRequirementType(
      requirementTypes?.find(
        (r) => Number(r.id) === Number(project.requirement_type_id)
      )
    );
    setModalInput_capabilitySummary(project.summary);
    setModalOpen(true);
  }, [project, contractors, branches, requirementTypes]);

  // Close modal
  const closeModal = useCallback(
    (save: boolean) => {
      setModalOpen(false);

      if (save) {
        if (
          typeof modalInput_projectName !== "string" ||
          typeof modalInput_contractNumber !== "string" ||
          typeof modalInput_ccarNumber !== "string" ||
          typeof modalInput_selectedContractor !== "object" ||
          typeof modalInput_selectedBranch !== "object" ||
          typeof modalInput_selectedRequirementType !== "object" ||
          typeof modalInput_capabilitySummary !== "string"
        ) {
          toast.error(
            toastMessage(
              "Error updating project.",
              "Please enter valid project details."
            )
          );
          return;
        }

        submitUpdateProject();
      }

      // Reset the input (use a timeout to wait for the modal close transition to finish)
      setTimeout(() => {
        setModalInput_projectName("");
        setModalInput_contractNumber("");
        setModalInput_ccarNumber("");
        setModalInput_selectedContractor(undefined);
        setModalInput_selectedBranch(undefined);
        setModalInput_selectedRequirementType(undefined);
        setModalInput_capabilitySummary("");
      }, 500);
    },
    [
      modalInput_projectName,
      modalInput_contractNumber,
      modalInput_ccarNumber,
      modalInput_selectedContractor,
      modalInput_selectedBranch,
      modalInput_selectedRequirementType,
      modalInput_capabilitySummary,
      submitUpdateProject,
    ]
  );

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Project Details</h1>
        {project.contract_status !== "Closed" && (
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4 pb-2 text-left sm:px-6 sm:pt-6">
        <p>
          <b>Project Name:</b> {project.project_name ?? "N/A"}
        </p>
        <p>
          <b>Contract Number:</b> {project.contract_num ?? "N/A"}
        </p>
        <p>
          <b>Contract Status:</b> {project.contract_status ?? "N/A"}
        </p>
        <p>
          <b>CCAR Number:</b> {project.ccar_num ?? "N/A"}
        </p>
        <p>
          <b>Contractor:</b> {project.contractor_name ?? "N/A"}
        </p>
        <p>
          <b>Organization/Branch:</b> {project.branch ?? "N/A"}
        </p>
        <p>
          <b>Requirement Type:</b> {project.requirement_type ?? "N/A"}
        </p>
        <p>
          <b>Capability Summary:</b> {project.summary ?? "N/A"}
        </p>
      </div>

      <div className="mt-2 flex justify-evenly gap-4">
        <Link
          href={`/projects/${project.id}/clin`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          See CLIN Data
        </Link>
        {project.contract_status !== "Closed" && (
          <button className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Upload ProPricer
          </button>
        )}
      </div>

      {/* Edit Details Modal */}
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. 'Project 1'"
                            value={modalInput_projectName}
                            onChange={(e) => {
                              setModalInput_projectName(e.target.value);
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. 'FA8620-22-Z-3333'"
                            value={modalInput_contractNumber}
                            onChange={(e) => {
                              setModalInput_contractNumber(e.target.value);
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. '1500'"
                            value={modalInput_ccarNumber}
                            onChange={(e) => {
                              setModalInput_ccarNumber(e.target.value);
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={Number(modalInput_selectedContractor?.id)}
                            onChange={(e) => {
                              setModalInput_selectedContractor(
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={Number(modalInput_selectedBranch?.id)}
                            onChange={(e) => {
                              setModalInput_selectedBranch(
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            value={Number(
                              modalInput_selectedRequirementType?.id
                            )}
                            onChange={(e) => {
                              setModalInput_selectedRequirementType(
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
                            className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
                            placeholder="This is a summary of the project's capability."
                            value={modalInput_capabilitySummary}
                            onChange={(e) => {
                              setModalInput_capabilitySummary(e.target.value);
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
    </div>
  );
}

export default ProjectDetails;
