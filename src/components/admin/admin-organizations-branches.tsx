import { useState } from "react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import type { branches } from "@prisma/client";

function AdminOrganizationsBranches() {
  const { data: branches } = api.branch.getAllWithNoProjects.useQuery();

  const [selectedBranch, setSelectedBranch] = useState<branches>();
  const [branchName, setBranchName] = useState<string>();

  const addBranch = api.branch.addBranch.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Branch",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("Branch Added", "The branch was added successfully.")
      );
      branches?.push(data);
    },
  });

  const submitAddBranch = () => {
    if (typeof branchName !== "string") {
      toast.error(
        toastMessage(
          "Error Adding Branch",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addBranch.mutate({
      branch_name: branchName,
    });

    setBranchName("");
  };

  const removeBranch = api.branch.removeBranch.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Branch",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("Branch Removed", "The branch was removed successfully.")
      );
      branches?.splice(
        branches.findIndex((branch) => Number(branch.id) === Number(data.id)),
        1
      );
    },
  });

  const submitRemoveBranch = () => {
    if (typeof selectedBranch !== "object") {
      toast.error(
        toastMessage(
          "Error Removing Branch",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    removeBranch.mutate({ id: selectedBranch.id });

    setSelectedBranch(undefined);
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Organizations/Branches</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Organizations/Branches
        </h1>

        {!branches ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            <div className="mt-2">
              <h2 className="text-lg font-medium">Add Organization/Branch</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="organization-branch-name">Name:</label>
                  <input
                    onChange={(e) => {
                      setBranchName(e.target.value);
                    }}
                    type="text"
                    id="organization-branch-name"
                    name="organization-branch-name"
                    placeholder="Organization/Branch Name"
                    value={branchName}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
              </div>

              <button
                onClick={submitAddBranch}
                className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
              >
                Add
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium">
                Remove Organization/Branch
              </h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="remove-organization-branch-name">
                    Select:
                  </label>
                  <select
                    onChange={(e) => {
                      setSelectedBranch(
                        branches?.find(
                          (branch) => branch.id === Number(e.target.value)
                        )
                      );
                    }}
                    id="remove-organization-branch-name"
                    name="remove-organization-branch-name"
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  >
                    {/* <option value="">Select Organization/Branch</option> */}
                    {branches?.map((branch) => (
                      <option key={branch.id} value={Number(branch.id)}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={submitRemoveBranch}
                    className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminOrganizationsBranches;
