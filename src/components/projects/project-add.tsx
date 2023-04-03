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

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: 'sjcaffery01@gmail.com', // Change to your recipient
      from: 'usafprojectmanagementdashboard@gmail.com', // Change to your verified sender
      subject: 'New Project Added',
      text: 'New project added in METIS dashboard.',
    }

    sgMail
    .send(msg)
    .then(() => {
      toast.success(
        toastMessage("Email Sent", "NICE")
      )
      console.log('Email sent')
    })
    .catch((error: any) => {
      toast.error(
        toastMessage("Email FAILED", "FAILURE")
      )
      console.error(error)
    })

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
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Add New Project</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        {/* Project Details */}
        <div className="mt-2">
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4 pl-16">
              <label htmlFor="contractor-name">Project Name:</label>
              <input
                onChange={(e) => {
                  setProjectName(e.target.value);
                }}
                type="text"
                id="contractor-name"
                name="contractor-name"
                placeholder="e.g. 'Design-a-box'"
                value={projectName}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-start gap-4 pl-16">
              <label htmlFor="contractor-name">Project Type:</label>
              <select
                onChange={(e) => {
                  setProjectType(e.target.value);
                }}
                id="remove-organization-branch-name"
                name="remove-organization-branch-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {/* Project types are static */}
                <option>Contract</option>
                <option>MIPR</option>
              </select>
            </div>
            <div className="mt-2 flex items-center justify-start gap-4 pl-16">
              <label htmlFor="contractor-name">Contractor:</label>
              <select
                onChange={(e) => {
                  setSelectedContractor(
                    contractors?.find(
                      (contractor) =>
                        Number(contractor.id) === Number(e.target.value)
                    )
                  );
                }}
                id="remove-organization-branch-name"
                name="remove-organization-branch-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {contractors?.map((contractor) => (
                  <option key={contractor.id} value={Number(contractor.id)}>
                    {contractor.contractor_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center justify-start gap-4 pl-16">
              <label htmlFor="contractor-name">Enter Branch:</label>
              <select
                onChange={(e) => {
                  setSelectedBranch(
                    branches?.find(
                      (branch) => Number(branch.id) === Number(e.target.value)
                    )
                  );
                }}
                id="remove-organization-branch-name"
                name="remove-organization-branch-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {branches?.map((branch) => (
                  <option key={branch.id} value={Number(branch.id)}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="contractor-name">Enter Requirement Type:</label>
              <select
                onChange={(e) => {
                  setSelectedRequirementType(
                    requirementTypes?.find(
                      (requirementType) =>
                        Number(requirementType.id) === Number(e.target.value)
                    )
                  );
                }}
                id="remove-organization-branch-name"
                name="remove-organization-branch-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
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
            <div className="mt-2 flex items-center justify-start gap-4 pl-2">
              <label htmlFor="contractor-name">Enter Project Summary:</label>
              <input
                onChange={(e) => {
                  setProjectSummary(e.target.value);
                }}
                type="text"
                id="project-summary"
                name="project-summary"
                placeholder="e.g. 'Build a box!'"
                value={projectSummary}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-start gap-4 pl-6">
              <label htmlFor="contractor-name">Enter CCAR Number:</label>
              <input
                onChange={(e) => {
                  setCcarNumber(e.target.value);
                }}
                type="text"
                id="ccar-number"
                name="ccar-number"
                placeholder="e.g. '1500'"
                value={ccarNumber}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>
        </div>

        {/* Contract Details */}
        <div className="mt-2 flex flex-col items-center justify-center">
          <div className="flex flex-col justify-evenly gap-2">
            {/* Contract Status */}
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="contractor-name">Contract Status:</label>
              <select
                onChange={(e) => {
                  setContractStatus(
                    e.target.value as contract_award_contract_status
                  );
                }}
                id="remove-organization-branch-name"
                name="remove-organization-branch-name"
                className="w-64 rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {/* Contract Status is static */}
                <option value="Pre_Award">Pre-Awarded</option>
                <option value="Awarded">Awarded</option>
              </select>
            </div>

            {/* Contract Number */}
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="contractor-name">Contract Number:</label>
              <input
                onChange={(e) => {
                  setContractNumber(e.target.value);
                }}
                type="text"
                id="contract-number"
                name="contract-number"
                placeholder="e.g. 'FA8620-22-Z-3333'"
                value={contractNumber}
                className="w-64 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
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
