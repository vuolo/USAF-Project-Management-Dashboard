import Slider from "rc-slider";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";
import { toastMessage } from "~/utils/toast";

function AdminContractAwardDays() {
  const { data: daysAdded } = api.contract.getDaysAdded.useQuery();

  const [draftDays, setDraftDays] = useState<number>();
  const [approvedDays, setApprovedDays] = useState<number>();
  const [releasedDays, setReleasedDays] = useState<number>();
  const [receivedDays, setReceivedDays] = useState<number>();
  const [techDays, setTechDays] = useState<number>();
  const [negotiationDays, setNegotiationDays] = useState<number>();
  const [awardedDays, setAwardedDays] = useState<number>();

  useEffect(() => {
    setDraftDays(daysAdded?.draft_rfp_released);
    setApprovedDays(daysAdded?.approved_by_acb);
    setReleasedDays(daysAdded?.rfp_released);
    setReceivedDays(daysAdded?.proposal_received);
    setTechDays(daysAdded?.tech_eval_comp);
    setNegotiationDays(daysAdded?.negotiation_comp);
    setAwardedDays(daysAdded?.awarded);
  }, [daysAdded]);

  const updateDaysAdded = api.contract.updateDaysAdded.useMutation({
    onError(error) {
      toast.error(
        toastMessage(
          "Error Updating Contract Award Days",
          "Please try again later. If the problem persists, please contact support."
        )
      );
      console.error(error);
    },
    onSuccess() {
      toast.success(
        toastMessage(
          "Contract Award Days Updated",
          "The days added were updated successfully."
        )
      );
    },
  });

  const submitDaysAdded = () => {
    if (
      typeof draftDays !== "number" ||
      typeof approvedDays !== "number" ||
      typeof releasedDays !== "number" ||
      typeof receivedDays !== "number" ||
      typeof techDays !== "number" ||
      typeof negotiationDays !== "number" ||
      typeof awardedDays !== "number"
    ) {
      toast.error(
        toastMessage(
          "Error Updating Contract Award Days",
          "Please make sure all fields are filled out."
        )
      );
      return;
    }

    updateDaysAdded.mutate({
      draft_rfp_released: draftDays,
      approved_by_acb: approvedDays,
      rfp_released: releasedDays,
      proposal_received: receivedDays,
      tech_eval_comp: techDays,
      negotiation_comp: negotiationDays,
      awarded: awardedDays,
    });
  };

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Contract Award Days</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Days Between Contract Award Milestones
        </h1>

        {typeof draftDays !== "number" ||
        typeof approvedDays !== "number" ||
        typeof releasedDays !== "number" ||
        typeof receivedDays !== "number" ||
        typeof techDays !== "number" ||
        typeof negotiationDays !== "number" ||
        typeof awardedDays !== "number" ? (
          <p className="italic">Loading...</p>
        ) : (
          <>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Requirements Planning → Draft RFP Released
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="requirements-planning-to-draft-rfp-released">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setDraftDays(Number(e.target.value));
                    }}
                    type="number"
                    id="requirements-planning-to-draft-rfp-released"
                    name="requirements-planning-to-draft-rfp-released"
                    value={draftDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setDraftDays(value as number);
                    }}
                    value={draftDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Draft RFP Released → Approved at ACB
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="draft-rfp-released-to-approved-at-acb">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setApprovedDays(Number(e.target.value));
                    }}
                    type="number"
                    id="draft-rfp-released-to-approved-at-acb"
                    name="draft-rfp-released-to-approved-at-acb"
                    value={approvedDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setApprovedDays(value as number);
                    }}
                    value={approvedDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Approved at ACB → RFP Released
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="approved-at-acb-to-rfp-released">Days:</label>
                  <input
                    onChange={(e) => {
                      setReleasedDays(Number(e.target.value));
                    }}
                    type="number"
                    id="approved-at-acb-to-rfp-released"
                    name="approved-at-acb-to-rfp-released"
                    value={releasedDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setReleasedDays(value as number);
                    }}
                    value={releasedDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                RFP Released → Proposal Received
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="rfp-released-to-proposal-received">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setReceivedDays(Number(e.target.value));
                    }}
                    type="number"
                    id="rfp-released-to-proposal-received"
                    name="rfp-released-to-proposal-received"
                    value={receivedDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setReceivedDays(value as number);
                    }}
                    value={receivedDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Proposal Received → Tech Eval Complete
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="proposal-received-to-tech-eval-complete">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setTechDays(Number(e.target.value));
                    }}
                    type="number"
                    id="proposal-received-to-tech-eval-complete"
                    name="proposal-received-to-tech-eval-complete"
                    value={techDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setTechDays(value as number);
                    }}
                    value={techDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Tech Eval Complete → Negotiations Complete
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="tech-eval-complete-to-negotiations-complete">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setNegotiationDays(Number(e.target.value));
                    }}
                    type="number"
                    id="tech-eval-complete-to-negotiations-complete"
                    name="tech-eval-complete-to-negotiations-complete"
                    value={negotiationDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setNegotiationDays(value as number);
                    }}
                    value={negotiationDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h2 className="text-lg font-medium">
                Negotiations Complete → Awarded
              </h2>
              <div className="flex justify-evenly gap-2">
                <div className="mt-2 flex items-center justify-center gap-4">
                  <label htmlFor="negotiations-complete-to-awarded">
                    Days:
                  </label>
                  <input
                    onChange={(e) => {
                      setAwardedDays(Number(e.target.value));
                    }}
                    type="number"
                    id="negotiations-complete-to-awarded"
                    name="negotiations-complete-to-awarded"
                    value={awardedDays}
                    min={0}
                    max={10000}
                    className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
                  />
                  <Slider
                    onChange={(value) => {
                      setAwardedDays(value as number);
                    }}
                    value={awardedDays}
                    min={0}
                    max={365}
                    style={{ width: "8rem" }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={submitDaysAdded}
              className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
            >
              Update Days
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminContractAwardDays;
