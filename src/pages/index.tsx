import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import DependencySummary from "~/components/summaries/dependency-summary";
import ScheduleSummary from "~/components/summaries/schedule-summary";
import FinancialSummary from "~/components/summaries/financial-summary";
import ProjectsOverview from "~/components/summaries/projects-overview";
import TailoredView from "~/components/summaries/tailored-view";
import React from "react";
import { sleep } from "~/utils/misc";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useSession().data?.db_user;
  const router = useRouter();

  // TODO: Remove before merge to main
  {
    const { data: projectsWithUpcomingDueMilestones } = api.project.getProjectsWithUpcomingDueMilestones.useQuery({ days: 60, favorites: true });
    console.log("projectsWithUpcomingDueMilestones", projectsWithUpcomingDueMilestones);
  }

  useEffect(() => {
    if (!router.query.hightlightProjects || !document) return;

    void (async () => {
      // Clear all currently highlighted dependencys
      const highlightedProjects =
        document.querySelectorAll(".highlight-project");
      for (const dependency of highlightedProjects)
        dependency.classList.remove("highlight-project");

      // Parse the dependency(s) to highlight
      const project_id = router.query.hightlightProjects as string | undefined;

      // Check for the dependency(s) to highlight every 100ms
      let dependenciesToHighlight;
      while (!dependenciesToHighlight || dependenciesToHighlight.length === 0) {
        // Get the element with a class name that includes BOTH milestones (this is the entire row of the dependency)
        dependenciesToHighlight = document.querySelectorAll(
          `.project-${project_id || "undefined"}`
        );
        await sleep(100);
      }

      // Apply the highlighted styling to the dependency
      for (const dependency of dependenciesToHighlight) {
        dependency.classList.add("highlight-project");
        setTimeout(
          () => dependency.classList.remove("highlight-project"),
          5000
        );
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
        {/* Left */}
        <div className="flex flex-col gap-6">
          <DependencySummary />
          <ScheduleSummary />
        </div>

        {/* Right */}
        {user?.user_role !== "Contractor" && (
          <div className="flex flex-col gap-6">
            <FinancialSummary />
          </div>
        )}
      </div>

      <div>
        <TailoredView />
      </div>

      {/* Underneath Top Section */}
      <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
        <ProjectsOverview />
      </div>
    </main>
  );
};

export default Home;
