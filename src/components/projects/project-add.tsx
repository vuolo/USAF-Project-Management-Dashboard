import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import type {
  branches,
  contractor,
  contract_award_contract_status,
  requirement_types,
} from "@prisma/client";

function ProjectAdd() {
  const router = useRouter();
  const { data: contractors } = api.contractor.getAll.useQuery();
  const { data: branches } = api.branch.getAll.useQuery();
  const { data: requirementTypes } = api.requirement_type.getAll.useQuery();

  const [projectName, setProjectName] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("Contract");
  const [selectedContractor, setSelectedContractor] = useState<contractor>();
  const [selectedBranch, setSelectedBranch] = useState<branches>();
  const [selectedRequirementType, setSelectedRequirementType] =
    useState<requirement_types>();
  const [projectSummary, setProjectSummary] = useState<string>("");
  const [ccarNumber, setCcarNumber] = useState<string>("");

  const [contractStatus, setContractStatus] =
    useState<contract_award_contract_status>("Pre_Award");
  const [contractNumber, setContractNumber] = useState<string>("");

  const addContractAward = api.contract.addContractAward.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Contract Award",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Contract Award Added",
          "The contract award was added successfully."
        )
      );
      void router.push(`/projects/${data.project_id ?? "0"}`);
    },
  });

  // Select the first contractor, branch, and requirement type by default
  useEffect(() => {
    setSelectedContractor(contractors?.[0]);
  }, [contractors]);
  useEffect(() => {
    setSelectedBranch(branches?.[0]);
  }, [branches]);
  useEffect(() => {
    setSelectedRequirementType(requirementTypes?.[0]);
  }, [requirementTypes]);

  const addProject = api.project.add.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Project",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      if (!data) {
        toast.error(
          toastMessage(
            "Error Adding Project",
            "Please try again later. If the problem persists, please contact support."
          )
        );
        return;
      }
      toast.success(
        toastMessage("Project Added", "The project was added successfully.")
      );
      addContractAward.mutate({
        project_id: data.id,
        contract_status: contractStatus,
        contract_num: contractNumber,
      });
    },
  });

  const submitAddProject = () => {
    if (
      typeof selectedContractor !== "object" ||
      typeof selectedBranch !== "object" ||
      typeof selectedRequirementType !== "object" ||
      typeof projectName !== "string" ||
      typeof projectType !== "string" ||
      typeof projectSummary !== "string" ||
      typeof ccarNumber !== "string" ||
      (projectType !== "Contract" && projectType !== "MIPR")
    ) {
      toast.error(
        toastMessage(
          "Error Adding Project",
          "Please make sure all fields are filled out correctly."
        )
      );
      return;
    }

    addProject.mutate({
      project_name: projectName,
      project_type: projectType,
      contractor_id: selectedContractor.id,
      branch_id: selectedBranch.id,
      requirement_type_id: selectedRequirementType.id,
      summary: projectSummary,
      ccar_num: ccarNumber,
    });
  };

  return (
    <div className="rounded-md bg-white shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center text-white">
        <h1>Add New Project</h1>
      </div>

      <div className="px-[2rem] py-6 sm:px-[8rem] md:px-[12rem]">
        {/* Project Details */}
        <div className="grid gap-4 text-right">
          {/* Project Name */}
          <div className="flex items-center gap-4">
            <label htmlFor="project-name" className="w-1/5">
              Project Name:
            </label>
            <input
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
              type="text"
              id="project-name"
              name="project-name"
              placeholder="e.g. 'Design-a-box'"
              value={projectName}
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            />
          </div>

          {/* Project Type */}
          <div className="flex items-center gap-4">
            <label htmlFor="project-type" className="w-1/5">
              Project Type:
            </label>
            <select
              onChange={(e) => {
                setProjectType(e.target.value);
              }}
              id="project-type"
              name="project-type"
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            >
              {/* Project types are static */}
              <option>Contract</option>
              <option>MIPR</option>
            </select>
          </div>

          {/* Contractor */}
          <div className="flex items-center gap-4">
            <label htmlFor="contractor-name" className="w-1/5">
              Contractor:
            </label>
            <select
              onChange={(e) => {
                setSelectedContractor(
                  contractors?.find(
                    (contractor) =>
                      Number(contractor.id) === Number(e.target.value)
                  )
                );
              }}
              id="contractor-name"
              name="contractor-name"
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            >
              {contractors?.map((contractor) => (
                <option key={contractor.id} value={Number(contractor.id)}>
                  {contractor.contractor_name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-4">
            <label htmlFor="branch-name" className="w-1/5">
              Branch:
            </label>
            <select
              onChange={(e) => {
                setSelectedBranch(
                  branches?.find(
                    (branch) => Number(branch.id) === Number(e.target.value)
                  )
                );
              }}
              id="branch-name"
              name="branch-name"
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            >
              {branches?.map((branch) => (
                <option key={branch.id} value={Number(branch.id)}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Requirement Type */}
          <div className="flex items-center gap-4">
            <label htmlFor="requirement-type" className="w-1/5">
              Requirement Type:
            </label>
            <select
              onChange={(e) => {
                setSelectedRequirementType(
                  requirementTypes?.find(
                    (requirementType) =>
                      Number(requirementType.id) === Number(e.target.value)
                  )
                );
              }}
              id="requirement-type"
              name="requirement-type"
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            >
              {requirementTypes?.map((requirementType) => (
                <option
                  key={requirementType.id}
                  value={Number(requirementType.id)}
                >
                  {requirementType.requirement_type}
                </option>
              ))}
            </select>
          </div>

          {/* Project Summary */}
          <div className="flex items-center gap-4">
            <label htmlFor="contractor-name" className="w-1/5">
              Project Summary:
            </label>
            <input
              onChange={(e) => {
                setProjectSummary(e.target.value);
              }}
              type="text"
              id="project-summary"
              name="project-summary"
              placeholder="e.g. 'Build a box!'"
              value={projectSummary}
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            />
          </div>

          {/* CCAR Number */}
          <div className="flex items-center gap-4">
            <label htmlFor="ccar-number" className="w-1/5">
              CCAR Number:
            </label>
            <input
              onChange={(e) => {
                setCcarNumber(e.target.value);
              }}
              type="text"
              id="ccar-number"
              name="ccar-number"
              placeholder="e.g. '1500'"
              value={ccarNumber}
              className="flex-grow rounded-md bg-gray-200 p-2 text-black"
            />
          </div>

          {/* Divider */}
          <div className="my-2 h-1 w-[90%] justify-self-center rounded-md bg-gray-100" />
        </div>

        {/* Contract Details */}
        <div className="flex flex-col gap-4 px-4 pt-4 md:px-6 lg:flex-row lg:justify-center lg:gap-8">
          {/* Contract Status */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center lg:w-1/2">
            <label htmlFor="contract-status" className="md:w-1/3 lg:text-left">
              Contract Status:
            </label>
            <select
              onChange={(e) => {
                setContractStatus(
                  e.target.value as contract_award_contract_status
                );
              }}
              id="contract-status"
              name="contract-status"
              className="w-full rounded-md bg-gray-200 p-2 text-black md:flex-grow"
            >
              {/* Contract Status options */}
              <option value="Pre_Award">Pre-Awarded</option>
              <option value="Awarded">Awarded</option>
            </select>
          </div>

          {/* Contract Number */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center lg:w-1/2">
            <label htmlFor="contract-number" className="md:w-1/3 lg:text-left">
              Contract Number:
            </label>
            <input
              onChange={(e) => {
                setContractNumber(e.target.value);
              }}
              type="text"
              id="contract-number"
              name="contract-number"
              placeholder="e.g. 'FA8620-22-Z-3333'"
              value={contractNumber}
              className="w-full rounded-md bg-gray-200 p-2 text-black md:flex-grow"
            />
          </div>
        </div>

        <button
          onClick={submitAddProject}
          className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          Add New Project
        </button>
      </div>
    </div>
  );
}

export default ProjectAdd;
