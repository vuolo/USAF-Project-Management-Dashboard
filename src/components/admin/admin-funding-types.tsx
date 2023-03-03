import { useState } from "react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import type { funding_types } from "@prisma/client";

function AdminFundingTypes() {
  const { data: fundingTypes } = api.funding_type.getAll.useQuery();

  const [selectedFundingType, setSelectedFundingType] =
    useState<funding_types>();
  const [fundingTypeName, setFundingTypeName] = useState<string>();

  const addFundingType = api.funding_type.addFundingType.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Funding Type",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Funding Type Added",
          "The funding type was added successfully."
        )
      );
      fundingTypes?.push(data);
    },
  });

  const submitAddFundingType = () => {
    if (typeof fundingTypeName !== "string") {
      toast.error(
        toastMessage(
          "Error Adding Funding Type",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addFundingType.mutate({
      funding_type: fundingTypeName,
      status: true,
    });

    setFundingTypeName("");
  };

  const removeFundingType = api.funding_type.deactivateFundingType.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Funding Type",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Funding Type Removed",
          "The funding type was removed successfully."
        )
      );
      const index = fundingTypes?.findIndex(
        (fundingType) => fundingType.id === data.id
      );
      if (index !== undefined) {
        fundingTypes?.splice(index, 1);
      }
    },
  });

  const submitRemoveFundingType = () => {
    if (selectedFundingType === undefined) {
      toast.error(
        toastMessage(
          "Error Removing Funding Type",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    removeFundingType.mutate({
      id: selectedFundingType.id,
    });

    setSelectedFundingType(undefined);
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Funding Types</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Funding Types</h1>
        <div className="mt-2">
          <h2 className="text-lg font-medium">Add Funding Type</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="funding-type">Funding Type:</label>
              <input
                onChange={(e) => {
                  setFundingTypeName(e.target.value);
                }}
                type="text"
                id="funding-type"
                name="funding-type"
                placeholder="Funding Type"
                value={fundingTypeName ?? ""}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button
            onClick={submitAddFundingType}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium">Remove Funding Type</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="remove-funding-type">Select:</label>
              <select
                onChange={(e) => {
                  setSelectedFundingType(
                    fundingTypes?.find(
                      (fundingType) =>
                        fundingType.id === parseInt(e.target.value)
                    )
                  );
                }}
                id="remove-funding-type"
                name="remove-funding-type"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {/* <option value="">Select Funding Type</option> */}
                {fundingTypes?.map((fundingType) => (
                  <option key={fundingType.id} value={fundingType.id}>
                    {fundingType.funding_type}
                  </option>
                ))}
              </select>

              <button
                onClick={submitRemoveFundingType}
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

export default AdminFundingTypes;
