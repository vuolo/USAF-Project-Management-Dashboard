import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { api } from "~/utils/api";
import { getDateDifferenceComponent } from "~/utils/format_dependencies";
import { classNames, getDayDifference } from "~/utils/misc";

function UpcomingEvents() {
    const [days, setDays] = useState(7);
    const [favorites, setFavorites] = useState(false);

    const { data: projects } = api.project.getProjectsWithUpcomingDueMilestones.useQuery({
        days: days,
        favorites: favorites,
        // allProjects: true
    });


    return (
        <div className="rounded-md bg-white pb-6 text-center shadow-md">
            <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
                <h1>Upcoming Due Milestones</h1>
            </div>

            <div className="w-full items-center justify-between gap-6 px-8 pb-6 pt-4 sm:min-w-[35rem]">
                <div className="mt-2 flex flex-row items-center justify-center gap-2">
                    <label>
                        Days:
                    </label>
                    <input
                        onChange={(e) => {
                            setDays(Number(e.target.value || 7));
                        }}
                        type="number"
                        id="upcomingDaysInput"
                        value={days}
                        min={0}
                        max={365 * 4}
                        placeholder="Days"
                        className="w-24 px-4 py-2 text-black">
                    </input>
                </div>
                <div className="mt-2 flex flex-row items-center justify-center gap-2">
                    <label>
                        Favorites: 
                    </label>
                    <input
                        onChange={(e) => {
                            setFavorites(!favorites);
                        }}
                        type="checkbox"
                        id="favoritesInput"
                        value={favorites ? "true" : "false"}
                        className="text-black">
                    </input>
                </div>
                {projects && projects.map((project, index) => (
                    <div className="mt-4">
                        <Disclosure>
                            {({ open }) => (
                                <>
                                    <Disclosure.Button
                                        className={classNames(
                                            "flex w-full items-center justify-between border border-black px-2 py-1 text-sm font-normal text-white shadow-sm focus:outline-none focus-visible:ring",
                                            open ? "rounded-t-md" : "rounded-md", project.project_milestones.some((p) => {
                                                if (p.end_date == null) return false;
                                                const currentDate = new Date();
                                                const nextDate = new Date();
                                                nextDate.setDate(currentDate.getDate() + 7);
                                                return p.end_date < nextDate;
                                            }) ? "bg-[red] hover:bg-red-600" : "bg-[green] hover:bg-green-600"
                                        )}
                                    >
                                        <span>
                                            {project.project_name}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            {project.project_milestones.length}
                                            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </div>
                                    </Disclosure.Button>
                                    <Disclosure.Panel className="flex flex-col overflow-hidden rounded-b-md border-x border-b border-black bg-white">
                                        {project.project_milestones.map((milestone, midx) => (
                                            <div
                                                className={classNames(
                                                    "flex items-start justify-between px-4 py-3 text-sm",
                                                    midx % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                                                )}
                                                key={index}
                                            >
                                                <div className="flex flex-col">
                                                    {milestone.task_name}
                                                    {/* <Link
                                                href={`/dependencies?highlightDependencies=${dependency.pred_milestone_id}_to_${dependency.succ_milestone_id}`}
                                                className="w-fit text-[#2767C8] underline"
                                              >
                                                {dependency.pred_milestone_name}
                                                {` → ${dependency.succ_milestone_name}`}
                                              </Link>
                                              <span className="text-left text-xs text-[#6A6A6A]">{`${
                                                dependency.pred_project_name || "Untitled"
                                              } → ${dependency.succ_project_name || "Untitled"}`}</span> */}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {/* {getDateDifferenceComponent(dependency.date_difference)}
                                              {dependency.pred_milestone_date && dependency.succ_milestone_date && (
                                                <span className="text-xs text-[#6A6A6A]">{`${new Date(
                                                  dependency.pred_milestone_date
                                                ).toLocaleDateString()} → ${new Date(
                                                  dependency.succ_milestone_date
                                                ).toLocaleDateString()}`}</span>
                                              )} */}
                                                    {milestone.end_date?.toLocaleDateString()} → {getDayDifference(new Date(), milestone.end_date!)} day(s)
                                                </div>
                                            </div>
                                        ))}
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UpcomingEvents;