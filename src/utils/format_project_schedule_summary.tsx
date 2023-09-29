import Link from "next/link"
// import { CountedMilestone } from "~/types/milestone"
import { classNames } from "./misc"
import { ProjectMilestoneSummary } from "~/types/milestone"

export const getDateDifferenceComponent = (date_difference?: number | bigint) => date_difference !== undefined && date_difference !== null ?
<span><span className="font-bold">{Math.abs(Number(date_difference))} Days</span> {date_difference > 0 ? "ahead" : "behind"}</span> : <span className="font-bold">N/A</span>

export const formatProjectScheduleSummary = (projectMilestoneSummaries?: ProjectMilestoneSummary[] | null | undefined) => projectMilestoneSummaries && projectMilestoneSummaries?.length > 0 ? projectMilestoneSummaries?.map((projectMilestoneSummary, index) => (
    <div className={classNames("flex justify-between text-sm py-3 items-start px-4", index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white")} key={index}>
      <div className="flex flex-col">
      <Link href={`?hightlightProjects=${projectMilestoneSummary.id}`} className="text-[#2767C8] underline w-fit">{projectMilestoneSummary.project_name}</Link>
        <span className="text-left text-[#6A6A6A] text-xs">{`${projectMilestoneSummary.branch}`}</span>
      </div>
      {getDateDifferenceComponent(projectMilestoneSummary.date_difference)}
    </div>
  )) : <div className="flex justify-center text-sm py-3 items-center px-4 bg-white text-[#6A6A6A]">NO PROJECTS TO DISPLAY...</div>
  