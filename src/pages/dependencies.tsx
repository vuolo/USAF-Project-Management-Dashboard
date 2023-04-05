import { type NextPage } from "next";

import DependencyGraph from "~/components/summaries/dependency-graph";
import DependencyOverview from "~/components/summaries/dependency-overview";
import DependencySummary from "~/components/summaries/dependency-summary";

const Dependencies: NextPage = () => {
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
