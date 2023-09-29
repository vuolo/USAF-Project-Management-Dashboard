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
    {date_difference > 0 ? "left" : "over"}
  </span>
);

export const formatDependencies = (
  dependencies?: CountedDependency[] | null | undefined
) =>
  dependencies && dependencies?.length > 0 ? (
    dependencies?.map((dependency, index) => (
      <div
        className={classNames(
          "flex items-start justify-between py-3 px-4 text-sm",
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
          {/* TODO: Make BOTH project names clickable to go to the respective project page */}
          <span className="text-left text-xs text-[#6A6A6A]">{`${dependency.pred_project_name} → ${dependency.succ_project_name}`}</span>
        </div>
        {getDateDifferenceComponent(dependency.date_difference)}
      </div>
    ))
  ) : (
    <div className="flex items-center justify-center bg-white py-3 px-4 text-sm text-[#6A6A6A]">
      NO DEPENDENCIES TO DISPLAY...
    </div>
  );
