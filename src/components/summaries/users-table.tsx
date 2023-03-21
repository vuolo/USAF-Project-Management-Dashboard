import { api } from "~/utils/api";
import ModalEditUser from "../admin/modals/modal-edit-user";
import { useState } from "react";
import { users } from "@prisma/client";

function UsersTable() {
  //let { data: allUsers } = api.user.getAll.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const {data: allUsers, refetch} = api.user.searchByName.useQuery({search: filter});
  const [selectedUser, setSelectedUser] = useState<users>({
    id: -1,
    contractor_id: -1,
    user_email: null,
    user_name: null,
    user_role: "IPT_Member"
  });

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users.
          </p>
        </div>
      </div>
      <div>
        <input 
          type="text"
          name="filter"
          id="filter"
          className="block w-full min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter user to search for"
          onChange={(e) => {
            setFilter(e.target.value);
            refetch();
          }}
        />
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!allUsers ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No users to display.
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        User Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Edit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {allUsers &&
                      allUsers.map((user, userIdx) => (
                        <tr
                          key={user.id}
                          className={
                            userIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.user_name || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.user_role || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {user.user_email || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setModalOpen(true);
                              }}
                              className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <ModalEditUser
          user={selectedUser}
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
        />
      </div>
    </>
  );
}

export default UsersTable;
