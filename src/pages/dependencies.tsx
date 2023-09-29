import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import DependencyGraph from "~/components/summaries/dependency-graph";
import DependencyOverview from "~/components/summaries/dependency-overview";
import DependencySummary from "~/components/summaries/dependency-summary";
import { sleep } from "~/utils/misc";

const Dependencies: NextPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    if (!router.query.highlightDependencies || !document) return;

    (async () => {
      // Clear all currently highlighted dependencys
      const highlightedDependencies = document.querySelectorAll(".highlight-dependency");
      for (const dependency of highlightedDependencies) dependency.classList.remove("highlight-dependency");

      // Parse the dependency(s) to highlight
      const pred_milestone_id = (router.query.highlightDependencies as string | undefined)?.split("_to_")[0];
      const succ_milestone_id = (router.query.highlightDependencies as string | undefined)?.split("_to_")[1];

      // Check for the dependency(s) to highlight every 100ms
      let dependenciesToHighlight;
      while (!dependenciesToHighlight || dependenciesToHighlight.length === 0) {
        // Get the element with a class name that includes BOTH milestones (this is the entire row of the dependency)
        dependenciesToHighlight = document.querySelectorAll(`.milestone-${pred_milestone_id}.milestone-${succ_milestone_id}`);
        await sleep(100);
      }

      // Apply the highlighted styling to the dependency
      for (const dependency of dependenciesToHighlight) {
        dependency.classList.add("highlight-dependency");
        setTimeout(() => dependency.classList.remove("highlight-dependency"), 5000);
      }

      // Scroll into view of the first dependency
      const firstDependency = dependenciesToHighlight[0];
      if (!firstDependency) return;
      firstDependency.scrollIntoView({ behavior: "smooth" });
    })();
  }, [router.query, document]);

  return (
    <main>
      {/* Top Section */}
      <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:justify-around sm:pt-6 lg:flex-row">
        <div className="flex flex-col gap-6">
          <DependencySummary includeButton={false} />
        </div>
      </div>

      {/* Underneath Top Section */}
      <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
        <DependencyGraph />
        <DependencyOverview />
      </div>
    </main>
  );
};

export default Dependencies;
