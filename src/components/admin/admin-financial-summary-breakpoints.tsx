import { api } from "~/utils/api";

function AdminFinancialSummaryBreakpoints() {
  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Financial Summary Breakpoints</h1>
      </div>

      <div className="flex flex-col justify-center gap-2 px-4 pt-4 pb-2 text-center sm:px-6 sm:pt-6">
        <h1 className="text-xl font-medium underline">
          Update Financial Breakpoints
        </h1>
        <div className="mt-2">
          <h2 className="text-lg font-bold">Obligation Breakpoints</h2>
          <div className="flex justify-evenly gap-2">
            <div className="mt-2 flex flex-col items-center justify-center gap-2">
              <label htmlFor="obligation-breakpoint-red">
                &quot;Red&quot; Percentage
              </label>
              <input
                type="number"
                id="obligation-breakpoint-red"
                name="obligation-breakpoint-red"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex flex-col items-center justify-center gap-2">
              <label htmlFor="obligation-breakpoint-yellow">
                &quot;Yellow&quot; Percentage
              </label>
              <input
                type="number"
                id="obligation-breakpoint-yellow"
                name="obligation-breakpoint-yellow"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-bold">Expenditure Breakpoints</h2>
          <div className="flex justify-evenly gap-2">
            <div className="mt-2 flex flex-col items-center justify-center gap-2">
              <label htmlFor="expenditure-breakpoint-red">
                &quot;Red&quot; Percentage
              </label>
              <input
                type="number"
                id="expenditure-breakpoint-red"
                name="expenditure-breakpoint-red"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
            <div className="mt-2 flex flex-col items-center justify-center gap-2">
              <label htmlFor="expenditure-breakpoint-yellow">
                &quot;Yellow&quot; Percentage
              </label>
              <input
                type="number"
                id="expenditure-breakpoint-yellow"
                name="expenditure-breakpoint-yellow"
                className="w-32 rounded-md bg-gray-200 px-4 py-2 text-black"
              />
            </div>
          </div>
        </div>
        <button className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto">
          Update Breakpoints
        </button>
      </div>
    </div>
  );
}

export default AdminFinancialSummaryBreakpoints;
