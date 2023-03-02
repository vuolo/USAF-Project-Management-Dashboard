import { api } from "~/utils/api";

function ScheduleSummary() {
  const { data: scheduleSummary } = api.milestone.getScheduleSummary.useQuery();

  return (
    <div className="rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Schedule Summary</h1>
      </div>

      <div className="flex items-center justify-between gap-6 px-8 pt-4 pb-6">
        {/* Green */}
        <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[green] px-4 py-2 text-center text-white sm:h-28">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Milestones on Schedule
          </h3>
          <h1 className="pt-2 text-2xl font-medium">
            {scheduleSummary?.green_sch?.toString() ?? "N/A"}
          </h1>
        </div>

        {/* Yellow */}
        <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[yellow] px-4 py-2 text-center text-black sm:h-28">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Milestones Within 5 Days
          </h3>
          <h1 className="pt-2 text-2xl font-medium">
            {scheduleSummary?.yellow_sch?.toString() ?? "N/A"}
          </h1>
        </div>

        {/* Red */}
        <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[red] px-4 py-2 text-center text-white sm:h-28">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Milestones Behind Schedule
          </h3>
          <h1 className="pt-2 text-2xl font-medium">
            {scheduleSummary?.red_sch?.toString() ?? "N/A"}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default ScheduleSummary;
