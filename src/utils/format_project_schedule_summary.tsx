import Link from "next/link";
// import { CountedMilestone } from "~/types/milestone"
import { classNames } from "./misc";
import { ProjectMilestoneSummary } from "~/types/milestone";

export const getDateDifferenceComponent = (date_difference?: number | bigint) =>
  date_difference !== undefined && date_difference !== null ? (
    <span>
      <span className="font-bold">
        {Math.abs(Number(date_difference))} Day
        {Math.abs(Number(date_difference)) !== 1 ? "s" : ""}
      </span>{" "}
      {date_difference < 0 ? "left" : "behind"}
    </span>
  ) : (
    <span className="font-bold">N/A</span>
  );

export const formatProjectScheduleSummary = (
  projectMilestoneSummaries?: ProjectMilestoneSummary[] | null | undefined
) =>
  projectMilestoneSummaries && projectMilestoneSummaries?.length > 0 ? (
    projectMilestoneSummaries?.map((projectMilestoneSummary, index) => (
      <div
        className={classNames(
          "flex items-start justify-between px-4 py-3 text-sm",
          index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
        )}
        key={index}
      >
        <div className="flex flex-col">
          <Link
            href={`?hightlightProjects=${projectMilestoneSummary.id}`}
            className="w-fit text-[#2767C8] underline"
          >
            {projectMilestoneSummary.project_name || "Untitled"}
          </Link>
          <span className="text-left text-xs text-[#6A6A6A]">{`${projectMilestoneSummary.branch}`}</span>
        </div>
        <div className="flex flex-col items-end">
          {getDateDifferenceComponent(projectMilestoneSummary.date_difference)}
          {projectMilestoneSummary.earliest_milestone_name &&
            projectMilestoneSummary.earliest_milestone_date && (
              <span className="text-xs text-[#6A6A6A]">{`${
                projectMilestoneSummary.earliest_milestone_name || "Untitled"
              } (${new Date(
                projectMilestoneSummary.earliest_milestone_date
              ).toLocaleDateString()})`}</span>
            )}
        </div>
      </div>
    ))
  ) : (
    <div className="flex items-center justify-center bg-white px-4 py-3 text-sm text-[#6A6A6A]">
      NO PROJECTS TO DISPLAY...
    </div>
  );
