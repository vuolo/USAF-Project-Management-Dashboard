import { api } from "~/utils/api";

function AdminUsers() {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Users</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">Update Users</h1>

        <div className="mt-2">
          <h2 className="text-lg font-medium">Add Admin</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="admin-name">Name:</label>
              <input
                type="text"
                id="admin-name"
                name="admin-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <label htmlFor="admin-email">Email:</label>
              <input
                type="text"
                id="admin-email"
                name="admin-email"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Add
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-medium">Add IPT</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="ipt-name">Name:</label>
              <input
                type="text"
                id="ipt-name"
                name="ipt-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <label htmlFor="ipt-email">Email:</label>
              <input
                type="text"
                id="ipt-email"
                name="ipt-email"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Add
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-medium">Add Contractor</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4 pl-8">
              <label htmlFor="contractor-name">Name:</label>
              <input
                type="text"
                id="contractor-name"
                name="contractor-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 pl-2">
              <label htmlFor="contractor-email">Summary:</label>
              <input
                type="text"
                id="contractor-email"
                name="contractor-email"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <label htmlFor="contractor-select">Contractor:</label>
              <input
                type="text"
                id="contractor-select"
                name="contractor-select"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>

          <button className="mt-4 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
            Add
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium">Remove User</h2>
          <div className="flex flex-col justify-evenly gap-2">
            <div className="mt-2 flex items-center justify-start gap-4">
              <label htmlFor="remove-user-name">Select:</label>
              <input
                type="text"
                id="remove-user-name"
                name="remove-user-name"
                className="w-full rounded-md bg-gray-200 px-4 py-2 text-black"
              />

              <button className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
