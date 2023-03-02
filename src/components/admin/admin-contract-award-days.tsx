import { api } from "~/utils/api";

function AdminContractAwardDays() {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Contract Award Days</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-bold underline">
          Update Days Between Contract Award Milestones
        </h1>
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
                type="number"
                id="requirements-planning-to-draft-rfp-released"
                name="requirements-planning-to-draft-rfp-released"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
                type="number"
                id="draft-rfp-released-to-approved-at-acb"
                name="draft-rfp-released-to-approved-at-acb"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
                type="number"
                id="approved-at-acb-to-rfp-released"
                name="approved-at-acb-to-rfp-released"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
              <label htmlFor="rfp-released-to-proposal-received">Days:</label>
              <input
                type="number"
                id="rfp-released-to-proposal-received"
                name="rfp-released-to-proposal-received"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
                type="number"
                id="proposal-received-to-tech-eval-complete"
                name="proposal-received-to-tech-eval-complete"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
                type="number"
                id="tech-eval-complete-to-negotiations-complete"
                name="tech-eval-complete-to-negotiations-complete"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
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
              <label htmlFor="negotiations-complete-to-awarded">Days:</label>
              <input
                type="number"
                id="negotiations-complete-to-awarded"
                name="negotiations-complete-to-awarded"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>
        </div>

        <button className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
          Update Days
        </button>
      </div>
    </div>
  );
}

export default AdminContractAwardDays;
