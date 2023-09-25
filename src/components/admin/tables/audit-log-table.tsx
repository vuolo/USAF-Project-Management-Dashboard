import { api } from "~/utils/api";
import ModalEditUser from "../modals/modal-edit-user";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { users } from "@prisma/client";
import ModalConfirmDeleteUser from "../modals/modal-confirm-delete-user";
import ModalAddAdmin from "../modals/modal-add-admin";
import ModalAddIPTMember from "../modals/modal-add-IPT";
import ModalAddContractor from "../modals/modal-add-contractor";
import ModalQuery from "../modals/modal-query";
import DatePicker, { Calendar, type DayValue, type DayRange } from "@hassanmojab/react-modern-calendar-datepicker";

type FilterType = "user_email" | "query" | "endpoint" | "succeeded" | "time";

function AuditLogTable() {
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("user_email");
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [dateRange, setDateRange] = useState<DayRange>({
    from: null,
    to: null
  });

  const refetchQuery = () => {
    void refetch();
  };

  // Original query
  const { data: allLogs, refetch } = api.auditlog.search.useQuery({
    filterQuery,
    filterType,
    dateRange: dateRange.from && dateRange.to ? {
      from: {
        year: dateRange.from.year,
        month: dateRange.from.month,
        day: dateRange.from.day
      },
      to: {
        year: dateRange.to.year,
        month: dateRange.to.month,
        day: dateRange.to.day
      }
    } : undefined
  });

  return (
    <>
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
          <option value="user_email">User Email</option>
          <option value="endpoint">Endpoint</option>
          {/* <option value="succeeded" disabled>Succeeded</option> */}
          <option value="time">Time</option>
          <option value="query">Query</option>
        </select>
        {filterType == "time" ? (
          <>
            <div>
              <DatePicker
                value={dateRange}
                onChange={setDateRange}
                inputPlaceholder="Select a range"
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {!allLogs ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">Loading...</div>
                </div>
              ) : allLogs?.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="italic text-gray-500">
                    No logs to display.
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
                        Endpoint
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Succeeded
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                      >
                        Query
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {allLogs &&
                      allLogs.map((logEntry, logEntryIdx) => (
                        <tr
                          key={logEntry.id}
                          className={
                            logEntryIdx % 2 === 0 ? undefined : "bg-gray-50"
                          }
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {logEntry.user || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {logEntry.endpoint || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {logEntry.succeeded ? "Yes" : "No"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {logEntry.time.toString() || "..."}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 overflow-clip">
                            <button
                              onClick={() => {
                                setSelectedQuery(logEntry.query);
                                setQueryModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
                            >
                              View Query
                            </button>
                            {/* {logEntry.query || "..."} */}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      <ModalQuery
        isOpen={queryModalOpen}
        setIsOpen={setQueryModalOpen}
        query={selectedQuery}
      />
    </>
  );
}

export default AuditLogTable;
