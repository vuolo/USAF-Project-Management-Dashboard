import { type NextPage } from "next";

import NavBar from "~/components/nav-bar";
import DependencySummary from "~/components/summaries/dependency-summary";
import ScheduleSummary from "~/components/summaries/schedule-summary";
import FinancialSummary from "~/components/summaries/financial-summary";

const Home: NextPage = () => {
  return (
    <>
      <NavBar />
      <main>
        {/* Top Section */}
        <div className="flex flex-col gap-6 px-2 pt-2 pb-2 sm:justify-around sm:pt-6 lg:flex-row">
          {/* Left */}
          <div className="flex flex-col gap-6">
            <DependencySummary />
            <ScheduleSummary />
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6">
            <FinancialSummary />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
