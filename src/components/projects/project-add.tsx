import { branches, contractor, requirement_types } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";

function AddProject() {
    const { data: branches } = api.branch.getAllWithNoProjects.useQuery();
    const { data: contractors } = api.contractor.getAllWithNoProjects.useQuery();
    const { data: requirementTypes } = api.requirement_type.getAll.useQuery();


    const [projectName, setProjectName] = useState<string>();
    const [projectType, setProjectType] = useState<string>();
    const [contractor, setContractor] = useState<contractor>();
    const [branch, setBranch] = useState<branches>();
    const [requirementType, setRequirementType] = useState<requirement_types>();
    const [projectSummary, setProjectSummary] = useState<string>();
    const [ccarNumber, setCcarNumber] = useState<number>();

    const submitAddProject = () => {
        // TODO: API calls and actually add it
      };


    return (
        <div className="rounded-md bg-white pb-6 text-center shadow-md">
            <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
                <h1>Add Project</h1>
            </div>

            <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
                
                <div className="mt-2">
                    <div className="flex flex-col justify-evenly gap-2">
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
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
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
                            <label htmlFor="contractor-name">Project Type:</label>
                            <select
                                onChange={(e) => {
                                    setProjectType(e.target.value);
                                }}
                                id="remove-organization-branch-name"
                                name="remove-organization-branch-name"
                                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                            >
                                {/* Project types doesn't seem to be a value that is dynamically added */}
                                <option>
                                    Contract
                                </option>
                                <option>
                                    MIPR
                                </option>
                            </select>
                        </div>
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
                            <label htmlFor="contractor-name">Contractor:</label>
                            <select
                                onChange={(e) => {
                                    setContractor(
                                        contractors?.find(
                                            (contractor) => contractor.id === Number(e.target.value)
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
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
                            <label htmlFor="contractor-name">Enter Branch:</label>
                            <select
                                onChange={(e) => {
                                    setBranch(
                                        branches?.find(
                                            (branch) => branch.id === Number(e.target.value)
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
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
                            <label htmlFor="contractor-name">Enter Requirement Type:</label>
                            <select
                                onChange={(e) => {
                                    setRequirementType(
                                        requirementTypes?.find(
                                            (requirementType) => requirementType.id === Number(e.target.value)
                                        )
                                    );
                                }}
                                id="remove-organization-branch-name"
                                name="remove-organization-branch-name"
                                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                            >
                                {requirementTypes?.map((requirementType) => (
                                    <option key={requirementType.id} value={Number(requirementType.id)}>
                                        {requirementType.requirement_type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-2 flex items-center justify-start gap-4 pl-6">
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
                            <label htmlFor="contractor-name">Enter CCar Number:</label>
                            <input
                                onChange={(e) => {
                                  setCcarNumber(parseInt(e.target.value));
                                }}
                                type="number"
                                id="ccar-number"
                                name="ccar-number"
                                placeholder="e.g. '1500'"
                                value={ccarNumber}
                                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                            />
                        </div>
                    </div>

                    <button
                        onClick={submitAddProject}
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );


}

export default AddProject;