import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";
import type { contractor, users } from "@prisma/client";
import UsersTable from "../summaries/users-table";

function AdminListUsers() {
  const { data: users } = api.user.getAll.useQuery();
  const { data: contractors } = api.contractor.getAll.useQuery();

  const [selectedUser, setSelectedUser] = useState<users>();

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
        <UsersTable />
      </div>
    </div>
  );
}

export default AdminListUsers;
