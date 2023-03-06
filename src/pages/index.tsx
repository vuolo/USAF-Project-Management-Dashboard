import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import NavBar from "~/components/nav-bar";
import DependencySummary from "~/components/summaries/dependency-summary";
import ScheduleSummary from "~/components/summaries/schedule-summary";
import FinancialSummary from "~/components/summaries/financial-summary";
import ProjectsOverview from "~/components/summaries/projects-overview";

const Home: NextPage = () => {
  const user = useSession().data?.db_user;

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
          {user?.user_role !== "Contractor" && (
            <div className="flex flex-col gap-6">
              <FinancialSummary />
            </div>
          )}
        </div>

        {/* Underneath Top Section */}
        <div className="px-4 pt-2 pb-2 sm:px-6 sm:pt-6">
          <ProjectsOverview />
        </div>
      </main>
    </>
  );
};

export default Home;
