import { api } from "~/utils/api";
import ModalEditUser from "../modals/modal-edit-user";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { users } from "@prisma/client";
import ModalConfirmDeleteUser from "../modals/modal-confirm-delete-user";
import ModalAddAdmin from "../modals/modal-add-admin";
import ModalAddIPTMember from "../modals/modal-add-IPT";
import ModalAddContractor from "../modals/modal-add-contractor";

type FilterType = "user_name" | "user_email" | "user_role" | "contractor_name";

function UsersTable() {
  //let { data: allUsers } = api.user.getAll.useQuery();
  const { data: contractors } = api.contractor.getAll.useQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("user_name");

  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [addIPTModalOpen, setAddIPTModalOpen] = useState(false);
  const [addContractorModalOpen, setAddContractorModalOpen] = useState(false);

  const refetchQuery = () => {
    void refetch();
  };

  // Original query
  const { data: allUsers, refetch } = api.user.search.useQuery({
    filterQuery,
    filterType,
  });

  const [selectedUser, setSelectedUser] = useState<users>({
    id: -1,
    contractor_id: -1,
    user_email: null,
    user_name: null,
    user_role: "IPT_Member",
  });

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="flex w-full justify-center gap-4">
          {/* <p className="mt-2 text-sm text-gray-700">A list of all the users.</p> */}
          <button
            onClick={() => {
              setAddAdminModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add Admin
          </button>
          <button
            onClick={() => {
              setAddIPTModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add IPT Member
          </button>
          <button
            onClick={() => {
              setAddContractorModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
          >
            Add Contractor
          </button>
        </div>
      </div>
      <div className="mt-4 flex w-fit gap-2 px-2">
        <input
          type="text"
          name="filter"
          id="filter"
          className="block w-full flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:min-w-full sm:text-sm"
          placeholder="Search..."
          onChange={(e) => {
            setFilterQuery(e.target.value);

            void refetch();
          }}
        />
        <select
          id="filter-select"
          name="filter-select"
          className="block flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-0 focus:ring-blue-500 sm:text-sm"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value as FilterType);
          }}
        >
          {/* Filter Type */}
          <option value="user_name">User Name</option>
          <option value="user_email">User Email</option>
          <option value="user_role">User Role</option>
          <option value="contractor_name">Contractor Name</option>
        </select>
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!allUsers ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : allUsers?.length === 0 ? (
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
                        Contractor
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Actions
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
                            {user.contractor_name === "None"
                              ? "..."
                              : user.contractor_name || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
                              >
                                Edit
                              </button>
                              <Trash2
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteUserModal(true);
                                }}
                                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {contractors && (
          <ModalEditUser
            user={selectedUser}
            contractors={contractors}
            refetch={refetchQuery}
            isOpen={modalOpen}
            setIsOpen={setModalOpen}
          />
        )}

        <ModalAddAdmin
          isOpen={addAdminModalOpen}
          setIsOpen={setAddAdminModalOpen}
          refetch={refetchQuery}
        />

        <ModalAddIPTMember
          isOpen={addIPTModalOpen}
          setIsOpen={setAddIPTModalOpen}
          refetch={refetchQuery}
        />

        <ModalAddContractor
          isOpen={addContractorModalOpen}
          setIsOpen={setAddContractorModalOpen}
          refetch={refetchQuery}
        />

        {/* Confirm Close Project Modal */}
        <ModalConfirmDeleteUser
          user={selectedUser}
          refetch={refetchQuery}
          isOpen={showDeleteUserModal}
          setIsOpen={setShowDeleteUserModal}
        />
      </div>
    </>
  );
}

export default UsersTable;
