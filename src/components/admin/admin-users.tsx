import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";
import type { contractor, users } from "@prisma/client";

function AdminUsers() {
  const { data: users } = api.user.getAll.useQuery();
  const { data: contractors } = api.contractor.getAll.useQuery();

  const [selectedUser, setSelectedUser] = useState<users>();
  const [selectedContractor, setSelectedContractor] = useState<contractor>();

  const [adminName, setAdminName] = useState<string>();
  const [adminEmail, setAdminEmail] = useState<string>();
  const [iptName, setIptName] = useState<string>();
  const [iptEmail, setIptEmail] = useState<string>();
  const [contractorName, setContractorName] = useState<string>();
  const [contractorSummary, setContractorSummary] = useState<string>();

  const addAdmin = api.user.add.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding Admin",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("Admin Added", "The admin was added successfully.")
      );
      users?.push(data);
    },
  });

  const submitAddAdmin = () => {
    if (typeof adminName !== "string" || typeof adminEmail !== "string") {
      toast.error(
        toastMessage(
          "Error Adding Admin",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addAdmin.mutate({
      contractor_id: 1,
      user_name: adminName,
      user_email: adminEmail,
      user_role: "Admin",
    });

    setAdminName("");
    setAdminEmail("");
  };

  const addIpt = api.user.add.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Adding IPT",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("IPT Added", "The IPT was added successfully.")
      );
      users?.push(data);
    },
  });

  const submitAddIpt = () => {
    if (typeof iptName !== "string" || typeof iptEmail !== "string") {
      toast.error(
        toastMessage(
          "Error Adding IPT",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    addIpt.mutate({
      contractor_id: 1,
      user_name: iptName,
      user_email: iptEmail,
      user_role: "IPT_Member",
    });

    setIptName("");
    setIptEmail("");
  };

  const addContractor = api.user.add.useMutation({
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
      users?.push(data);
    },
  });

  const submitAddContractor = () => {
    if (
      typeof contractorName !== "string" ||
      typeof contractorSummary !== "string" ||
      selectedContractor === undefined
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
      contractor_id: selectedContractor.id,
      user_name: contractorName,
      user_email: contractorSummary,
      user_role: "Contractor",
    });

    setContractorName("");
    setContractorSummary("");
  };

  const removeUser = api.user.delete.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Removing User",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess(data) {
      toast.success(
        toastMessage("User Removed", "The user was removed successfully.")
      );
      users?.splice(users.indexOf(data), 1);
    },
  });

  const submitRemoveUser = () => {
    if (typeof selectedUser !== "object") {
      toast.error(
        toastMessage(
          "Error Removing User",
          "Please make sure a user is selected."
        )
      );
      return;
    }

    removeUser.mutate(selectedUser);
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Users</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Users</h1>

        {!users || !contractors ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            <div className="mt-2">
              <h2 className="text-lg font-medium">Add Admin</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="admin-name">Name:</label>
                  <input
                    onChange={(e) => {
                      setAdminName(e.target.value);
                    }}
                    type="text"
                    id="admin-name"
                    name="admin-name"
                    placeholder="e.g. 'John Doe'"
                    value={adminName ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 pl-1">
                  <label htmlFor="admin-email">Email:</label>
                  <input
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                    }}
                    type="email"
                    id="admin-email"
                    name="admin-email"
                    placeholder="e.g. 'admin@example.com'"
                    value={adminEmail ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
              </div>

              <button
                onClick={submitAddAdmin}
                className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
              >
                Add
              </button>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-medium">Add IPT</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="ipt-name">Name:</label>
                  <input
                    onChange={(e) => {
                      setIptName(e.target.value);
                    }}
                    type="text"
                    id="ipt-name"
                    name="ipt-name"
                    placeholder="e.g. 'John Doe'"
                    value={iptName ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 pl-1">
                  <label htmlFor="ipt-email">Email:</label>
                  <input
                    onChange={(e) => {
                      setIptEmail(e.target.value);
                    }}
                    type="email"
                    id="ipt-email"
                    name="ipt-email"
                    placeholder="e.g. 'ipt@example.com'"
                    value={iptEmail ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
              </div>

              <button
                onClick={submitAddIpt}
                className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
              >
                Add
              </button>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-medium">Add Contractor</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4 pl-9">
                  <label htmlFor="contractor-name">Name:</label>
                  <input
                    onChange={(e) => {
                      setContractorName(e.target.value);
                    }}
                    type="text"
                    id="contractor-name"
                    name="contractor-name"
                    placeholder="e.g. 'John Doe'"
                    value={contractorName ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
                <div className="mt-2 flex items-center justify-center gap-4 pl-2">
                  <label htmlFor="contractor-email">Summary:</label>
                  <input
                    onChange={(e) => {
                      setContractorSummary(e.target.value);
                    }}
                    type="text"
                    id="contractor-email"
                    name="contractor-email"
                    placeholder="e.g. 'John Doe is a contractor at the Department of Defense'"
                    value={contractorSummary ?? ""}
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                </div>
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="contractor-select">Contractor:</label>
                  <select
                    onChange={(e) => {
                      setSelectedContractor(
                        contractors?.find(
                          (contractor) =>
                            contractor.id === Number(e.target.value)
                        )
                      );
                    }}
                    id="contractor-select"
                    name="contractor-select"
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  >
                    {/* <option value="">Select a contractor</option> */}
                    {contractors?.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.contractor_name}
                      </option>
                    ))}
                  </select>
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
              <h2 className="text-lg font-medium">Remove User</h2>
              <div className="flex flex-col justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-start gap-4">
                  <label htmlFor="remove-user-name">Select:</label>
                  <select
                    onChange={(e) =>
                      setSelectedUser(
                        users?.find(
                          (user) => user.id === Number(e.target.value)
                        )
                      )
                    }
                    id="remove-user-name"
                    name="remove-user-name"
                    className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
                  >
                    {/* <option>Select User</option> */}
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.user_name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={submitRemoveUser}
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

export default AdminUsers;
