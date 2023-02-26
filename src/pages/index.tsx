import { type NextPage } from "next";
import Link from "next/link";
import NavBar from "~/components/nav-bar";

const Home: NextPage = () => {
  return (
    <>
      <NavBar />
      <main className="flex justify-around pt-6">
        {/* Left */}
        <div className="flex flex-col gap-6">
          {/* Dependency Summary */}
          <div className="rounded-b-md bg-white pb-6 text-center shadow-md">
            <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
              <h1>Dependency Summary</h1>
            </div>

            <div className="flex items-center justify-between gap-6 px-8 pt-4 pb-6">
              {/* Green */}
              <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[green] px-4 py-2 text-center text-white">
                <h3 className="h-12 text-xs">
                  Tracked Dependencies With &gt;5 Days Schedule Margin
                </h3>
                <h1 className="pt-4 text-2xl font-medium">2</h1>
              </div>

              {/* Yellow */}
              <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[yellow] px-4 py-2 text-center text-black">
                <h3 className="h-12 text-xs">
                  Tracked Dependencies With &lt;5 Days Schedule Margin
                </h3>
                <h1 className="pt-4 text-2xl font-medium">1</h1>
              </div>

              {/* Red */}
              <div className="h-[7.5rem] w-40 rounded-sm border border-black bg-[red] px-4 py-2 text-center text-white">
                <h3 className="h-12 text-xs">
                  Tracked Dependencies With Tracked Impacts
                </h3>
                <h1 className="pt-4 text-2xl font-medium">1</h1>
              </div>
            </div>

            <Link
              href="/dependency"
              className="rounded-md bg-brand-dark px-4 py-2 text-center text-white shadow-sm hover:bg-brand-dark/90"
            >
              See Dependencies
            </Link>
          </div>

          {/* Schedule Summary */}
          <div className="rounded-b-md bg-white text-center shadow-md">
            <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
              <h1>Schedule Summary</h1>
            </div>

            <div className="flex items-center justify-between gap-6 px-8 pt-4 pb-6">
              {/* Green */}
              <div className="h-28 w-40 rounded-sm border border-black bg-[green] px-4 py-2 text-center text-white">
                <h3 className="h-12 text-xs">Tracked Milestones on Schedule</h3>
                <h1 className="pt-2 text-2xl font-medium">2</h1>
              </div>

              {/* Yellow */}
              <div className="h-28 w-40 rounded-sm border border-black bg-[yellow] px-4 py-2 text-center text-black">
                <h3 className="h-12 text-xs">
                  Tracked Milestones Within 5 Days
                </h3>
                <h1 className="pt-2 text-2xl font-medium">0</h1>
              </div>

              {/* Red */}
              <div className="h-28 w-40 rounded-sm border border-black bg-[red] px-4 py-2 text-center text-white">
                <h3 className="h-12 text-xs">
                  Tracked Milestones Behind Schedule
                </h3>
                <h1 className="pt-2 text-2xl font-medium">2</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-6">
          {/* Financial Summary */}
          <div className="rounded-b-md bg-white text-center shadow-md">
            <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
              <h1>Financial Summary</h1>
            </div>

            <div className="flex h-[26.5rem] items-center justify-between gap-6 px-8 pt-4 pb-6"></div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
