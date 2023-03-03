import { useState } from "react";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { api } from "~/utils/api";
import type { military_job_titles } from "@prisma/client";

function AdminMilitaryJobTitles() {
  const { data: militaryJobTitles } = api.mjt.getAllNotInUse.useQuery();

  const [selectedMilitaryJobTitle, setSelectedMilitaryJobTitle] =
    useState<military_job_titles>();
  const [militaryJobTitle, setMilitaryJobTitle] = useState<string>();

  const addMilitaryJobTitle = api.mjt.addTitle.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Military Job Title",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Military Job Title Added",
          "The military job title was added successfully."
        )
      );
      militaryJobTitles?.push(data);
    },
  });

  const submitAddMilitaryJobTitle = () => {
    if (typeof militaryJobTitle !== "string") {
      toast.error(
        toastMessage(
          "Error Adding Military Job Title",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addMilitaryJobTitle.mutate({ mil_job_title: militaryJobTitle });

    setMilitaryJobTitle("");
  };

  const removeMilitaryJobTitle = api.mjt.removeTitle.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing Military Job Title",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage(
          "Military Job Title Removed",
          "The military job title was removed successfully."
        )
      );
      const index = militaryJobTitles?.findIndex(
        (militaryJobTitle) => militaryJobTitle.id === data.id
      );
      if (index !== undefined) {
        militaryJobTitles?.splice(index, 1);
      }
    },
  });

  const submitRemoveMilitaryJobTitle = () => {
    if (selectedMilitaryJobTitle === undefined) {
      toast.error(
        toastMessage(
          "Error Removing Military Job Title",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    removeMilitaryJobTitle.mutate({ id: selectedMilitaryJobTitle.id });
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Military Job Titles</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Military Job Titles
        </h1>
        <div className="mt-2">
          <h2 className="text-lg font-medium">Add Military Job Titles</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="military-job-title">Job Title:</label>
              <input
                onChange={(e) => {
                  setMilitaryJobTitle(e.target.value);
                }}
                type="text"
                id="military-job-title"
                name="military-job-title"
                placeholder="e.g. 'Airman First Class'"
                value={militaryJobTitle}
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button
            onClick={submitAddMilitaryJobTitle}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium">Remove Military Job Title</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="remove-military-job-title">Select:</label>
              <select
                onChange={(e) => {
                  setSelectedMilitaryJobTitle(
                    militaryJobTitles?.find(
                      (militaryJobTitle) =>
                        militaryJobTitle.id === parseInt(e.target.value)
                    )
                  );
                }}
                id="remove-military-job-title"
                name="remove-military-job-title"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              >
                {/* <option value="">Select a Military Job Title</option> */}
                {militaryJobTitles?.map((militaryJobTitle) => (
                  <option key={militaryJobTitle.id} value={militaryJobTitle.id}>
                    {militaryJobTitle.mil_job_title}
                  </option>
                ))}
              </select>

              <button
                onClick={submitRemoveMilitaryJobTitle}
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

export default AdminMilitaryJobTitles;
