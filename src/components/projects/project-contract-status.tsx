import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";
import { isInvalidDate } from "~/utils/date";
import { api } from "~/utils/api";

import ModalAddProjectContract from "./modals/modal-add-project-contract";

import type { view_project } from "~/types/view_project";
import ModalConfirmProjectMarkAwarded from "./modals/modal-confirm-project-mark-awarded";
import ModalEditProjectContractStatus from "./modals/modal-edit-project-contract-status";

function ProjectContractStatus({ project }: { project: view_project }) {
  const router = useRouter();
  const user = useSession().data?.db_user;
  const { data: contractAwardTimeline } =
    api.contract.getContractAwardTimeline.useQuery({ project_id: project.id });
  const { data: contractAward } = api.contract.getContractAward.useQuery({
    project_id: project.id,
  });

  // TODO: determine when a project can be awarded
  const [canBeAwarded, setCanBeAwarded] = useState(true);

  const [markAwardedModalOpen, setMarkAwardedModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="flex items-center justify-between rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
        <h1>Contract Status</h1>
        {project.contract_status !== "Closed" &&
          user?.user_role !== "Contractor" && (
            <div className="flex gap-3">
              {canBeAwarded && (
                <button
                  onClick={() => setMarkAwardedModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
                >
                  Award Project
                </button>
              )}

              <button
                onClick={() =>
                  !contractAward || contractAwardTimeline?.length === 0
                    ? setAddModalOpen(true)
                    : setEditModalOpen(true)
                }
                className="inline-flex items-center justify-center rounded-md border-2 border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-light focus:outline-none focus:ring-0 focus:ring-brand-light focus:ring-offset-2 sm:w-auto"
              >
                {!contractAward || contractAwardTimeline?.length === 0
                  ? "Add"
                  : "Edit"}
              </button>
            </div>
          )}
      </div>

      <div className="flex flex-col justify-around gap-2 pt-4 pb-2 text-left sm:px-6 sm:pt-6 md:flex-row">
        <div className="flex w-full flex-col gap-4 overflow-auto p-2 text-center">
          <div className="mt-2 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {!contractAwardTimeline ? (
                    <div className="flex h-64 items-center justify-center px-64">
                      <div className="italic text-gray-500">Loading...</div>
                    </div>
                  ) : contractAwardTimeline.length === 0 ? (
                    <div className="flex h-64 w-full items-center justify-center px-8">
                      <div className="italic text-gray-500">
                        This project has no contract award timeline.
                      </div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Timeline Status
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Requirements Planning
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Draft RFP Released
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Approved at ABC
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            RFP Released
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Proposal Received
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Tech Eval Complete
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Negotiations Complete
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Awarded
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {contractAwardTimeline &&
                          contractAwardTimeline.map((timeline, timelineIdx) => (
                            <tr
                              key={timeline.id}
                              className={
                                timelineIdx % 2 === 0 ? undefined : "bg-gray-50"
                              }
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-black sm:pl-6">
                                {timeline.timeline_status}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.requirement_plan)
                                  ? format(
                                      new Date(timeline.requirement_plan || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.draft_rfp_released)
                                  ? format(
                                      new Date(
                                        timeline.draft_rfp_released || ""
                                      ),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.approved_by_acb)
                                  ? format(
                                      new Date(timeline.approved_by_acb || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.rfp_released)
                                  ? format(
                                      new Date(timeline.rfp_released || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.proposal_received)
                                  ? format(
                                      new Date(
                                        timeline.proposal_received || ""
                                      ),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.tech_eval_comp)
                                  ? format(
                                      new Date(timeline.tech_eval_comp || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.negotiation_comp)
                                  ? format(
                                      new Date(timeline.negotiation_comp || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {!isInvalidDate(timeline.awarded)
                                  ? format(
                                      new Date(timeline.awarded || ""),
                                      "MM/dd/yyyy"
                                    )
                                  : "..."}
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
        </div>
      </div>

      {/* Confirm Project Mark Awarded Modal */}
      <ModalConfirmProjectMarkAwarded
        contractAward={contractAward}
        isOpen={markAwardedModalOpen}
        setIsOpen={setMarkAwardedModalOpen}
      />

      {/* Edit Contract Status Modal */}
      <ModalEditProjectContractStatus
        contractAwardTimeline={contractAwardTimeline}
        isOpen={editModalOpen}
        setIsOpen={setEditModalOpen}
      />

      {/* Add Contract Award Timeline Modal */}
      <ModalAddProjectContract
        contractAward={contractAward}
        isOpen={addModalOpen}
        setIsOpen={setAddModalOpen}
      />
    </div>
  );
}

export default ProjectContractStatus;
