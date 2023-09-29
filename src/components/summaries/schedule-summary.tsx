import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { formatProjectScheduleSummary } from "~/utils/format_project_schedule_summary";
import { classNames } from "~/utils/misc";

function ScheduleSummary() {
  const { data: scheduleSummary } = api.milestone.getScheduleSummary.useQuery();

  const { data: scheduleSummaryWithProjects } = api.milestone.getScheduleSummaryWithProjects.useQuery();
  useEffect(() => {
    console.log("scheduleSummaryWithProjects", scheduleSummaryWithProjects);
  }, [scheduleSummaryWithProjects]);

  return (
    <div className="rounded-md bg-white text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Schedule Summary</h1>
      </div>

      <div className="w-full sm:min-w-[35rem] items-center justify-between gap-6 px-8 pt-4 pb-6">
        <h1 className= "flex italic">Tracked Projects with Milestones...</h1>
        {/* Green */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[green] px-2 py-1 text-sm font-normal text-white hover:bg-green-600 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>On Schedule</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{scheduleSummary?.green_sch?.toString() ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatProjectScheduleSummary(scheduleSummaryWithProjects?.greenProjects)}
                  </Disclosure.Panel>
              </>
              )}
          </Disclosure>
        </div>

        {/* Yellow */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[yellow] px-2 py-1 text-sm font-normal text-black hover:bg-yellow-300 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>Within 5 Days</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{scheduleSummary?.yellow_sch?.toString() ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatProjectScheduleSummary(scheduleSummaryWithProjects?.yellowProjects)}
                  </Disclosure.Panel>
              </>
              )}
          </Disclosure>
        </div>

        {/* Red */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[red] px-2 py-1 text-sm font-normal text-white hover:bg-red-600 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>Behind Schedule</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{scheduleSummary?.red_sch?.toString() ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatProjectScheduleSummary(scheduleSummaryWithProjects?.redProjects)}
                  </Disclosure.Panel>
              </>
              )}
          </Disclosure>
        </div>      
      </div>
    </div>
  );
}

export default ScheduleSummary;
