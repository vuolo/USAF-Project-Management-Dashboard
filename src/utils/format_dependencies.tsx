import Link from "next/link"
import { CountedDependency } from "~/types/milestone"
import { classNames } from "./misc"

export const getDateDifferenceComponent = (date_difference: number | bigint) => 
<span><span className="font-bold">{Math.abs(Number(date_difference))} Days</span> {date_difference > 0 ? "left" : "over"}</span>

export const formatDependencies = (dependencies?: CountedDependency[] | null | undefined) => dependencies && dependencies?.length > 0 ? dependencies?.map((dependency, index) => (
    <div className={classNames("flex justify-between text-sm py-3 items-start px-4", index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white")} key={index}>
      <div className="flex flex-col">
        <Link href={`/dependencies?highlightDependencies=${dependency.pred_milestone_id}_to_${dependency.succ_milestone_id}`} className="text-[#2767C8] underline w-fit">{dependency.pred_milestone_name}{` → ${dependency.succ_milestone_name}`}</Link>
        {/* TODO: Make BOTH project names clickable to go to the respective project page */}
        <span className="text-left text-[#6A6A6A] text-xs">{`${dependency.pred_project_name} → ${dependency.succ_project_name}`}</span>
      </div>
      {getDateDifferenceComponent(dependency.date_difference)}
    </div>
  )) : <div className="flex justify-center text-sm py-3 items-center px-4 bg-white text-[#6A6A6A]">NO DEPENDENCIES TO DISPLAY...</div>