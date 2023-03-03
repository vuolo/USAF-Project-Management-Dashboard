import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";
import type { contractor } from "@prisma/client";

function AdminContractors() {
  const { data: contractors } = api.contractor.getAllWithNoProjects.useQuery();

  const [selectedContractor, setSelectedContractor] = useState<contractor>();
  const [contractorName, setContractorName] = useState<string>();
  const [contractorSummary, setContractorSummary] = useState<string>();

  const addContractor = api.contractor.addContractor.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Contractor",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Contractor Added",
          "The contractor was added successfully."
        )
      );
      contractors?.push(data);
    },
  });

  const submitAddContractor = () => {
    if (
      typeof contractorName !== "string" ||
      typeof contractorSummary !== "string"
    ) {
      toast.error(
        toastMessage(
          "Error Adding Contractor",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addContractor.mutate({
      contractor_name: contractorName,
      summary: contractorSummary,
    });

    setContractorName("");
    setContractorSummary("");
  };

  const removeContractor = api.contractor.removeContractor.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Contractor",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Contractor Removed",
          "The contractor was removed successfully."
        )
      );
      contractors?.splice(
        contractors.findIndex(
          (contractor) => Number(contractor.id) === Number(data.id)
        ),
        1
      );
    },
  });

  const submitRemoveContractor = () => {
    console.log(selectedContractor);
    if (typeof selectedContractor !== "object") {
      toast.error(
        toastMessage(
          "Error Removing Contractor",
          "Please make sure a contractor is selected."
        )
      );
      return;
    }

    removeContractor.mutate({ id: Number(selectedContractor.id) });

    setSelectedContractor(undefined);
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Contractors</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Contractors</h1>
        <div className="mt-2">
          <h2 className="text-lg font-medium">Add Contractor</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4 pl-6">
              <label htmlFor="contractor-name">Name:</label>
              <input
                onChange={(e) => {
                  setContractorName(e.target.value);
                }}
                type="text"
                id="contractor-name"
                name="contractor-name"
                placeholder="e.g. 'John Doe'"
                value={contractorName}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <label htmlFor="contractor-summary">Summary:</label>
              <input
                onChange={(e) => {
                  setContractorSummary(e.target.value);
                }}
                type="text"
                id="contractor-summary"
                name="contractor-summary"
                placeholder="e.g. 'John Doe is a contractor at the Department of Defense'"
                value={contractorSummary}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button
            onClick={submitAddContractor}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium">Remove Contractor</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="remove-contractor-select">Select:</label>
              <select
                onChange={(e) => {
                  setSelectedContractor(
                    contractors?.find(
                      (contractor) =>
                        Number(contractor.id) === Number(e.target.value)
                    )
                  );
                }}
                id="remove-contractor-select"
                name="remove-contractor-select"
                placeholder="e.g. 'John Doe'"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {contractors?.map((contractor) => (
                  <option key={contractor.id} value={Number(contractor.id)}>
                    {contractor.contractor_name}
                  </option>
                ))}
              </select>

              <button
                onClick={submitRemoveContractor}
                className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminContractors;
