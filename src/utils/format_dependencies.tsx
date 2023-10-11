import Link from "next/link";
import { CountedDependency } from "~/types/milestone";
import { classNames } from "./misc";

export const getDateDifferenceComponent = (
  date_difference: number | bigint
) => (
  <span>
    <span className="font-bold">
      {Math.abs(Number(date_difference))} Day
      {Math.abs(Number(date_difference)) !== 1 ? "s" : ""}
    </span>{" "}
    {date_difference > 0 ? "left" : "behind"}
  </span>
);

export const formatDependencies = (
  dependencies?: CountedDependency[] | null | undefined
) =>
  dependencies && dependencies?.length > 0 ? (
    dependencies?.map((dependency, index) => (
      <div
        className={classNames(
          "flex items-start justify-between px-4 py-3 text-sm",
          index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
        )}
        key={index}
      >
        <div className="flex flex-col">
          <Link
            href={`/dependencies?highlightDependencies=${dependency.pred_milestone_id}_to_${dependency.succ_milestone_id}`}
            className="w-fit text-[#2767C8] underline"
          >
            {dependency.pred_milestone_name}
            {` → ${dependency.succ_milestone_name}`}
          </Link>
          <span className="text-left text-xs text-[#6A6A6A]">{`${
            dependency.pred_project_name || "Untitled"
          } → ${dependency.succ_project_name || "Untitled"}`}</span>
        </div>
        <div className="flex flex-col items-end">
          {getDateDifferenceComponent(dependency.date_difference)}
          {dependency.pred_milestone_date && dependency.succ_milestone_date && (
            <span className="text-xs text-[#6A6A6A]">{`${new Date(
              dependency.pred_milestone_date
            ).toLocaleDateString()} → ${new Date(
              dependency.succ_milestone_date
            ).toLocaleDateString()}`}</span>
          )}
        </div>
      </div>
    ))
  ) : (
    <div className="flex items-center justify-center bg-white px-4 py-3 text-sm text-[#6A6A6A]">
      NO DEPENDENCIES TO DISPLAY...
    </div>
  );
