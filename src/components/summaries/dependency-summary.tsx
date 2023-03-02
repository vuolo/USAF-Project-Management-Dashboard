import Link from "next/link";
import { api } from "~/utils/api";

function DependencySummary() {
  const { data: greenDependency } = api.dependency.getGreen.useQuery();
  const { data: yellowDependency } = api.dependency.getYellow.useQuery();
  const { data: redDependency } = api.dependency.getRed.useQuery();

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Dependency Summary</h1>
      </div>

      <div className="flex items-center justify-between gap-6 px-2 pt-4 pb-6 sm:px-8">
        {/* Green */}
        <div className="h-[8rem] w-40 rounded-sm border border-black bg-[green] px-4 py-2 text-center text-white sm:h-[7.5rem]">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Dependencies With &gt;5 Days Schedule Margin
          </h3>
          <h1 className="pt-4 text-2xl font-medium">
            {greenDependency?.count?.toString() ?? "N/A"}
          </h1>
        </div>

        {/* Yellow */}
        <div className="h-[8rem] w-40 rounded-sm border border-black bg-[yellow] px-4 py-2 text-center text-black sm:h-[7.5rem]">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Dependencies With &lt;5 Days Schedule Margin
          </h3>
          <h1 className="pt-4 text-2xl font-medium">
            {yellowDependency?.count?.toString() ?? "N/A"}
          </h1>
        </div>

        {/* Red */}
        <div className="h-[8rem] w-40 rounded-sm border border-black bg-[red] px-4 py-2 text-center text-white sm:h-[7.5rem]">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Dependencies With Tracked Impacts
          </h3>
          <h1 className="pt-4 text-2xl font-medium">
            {redDependency?.count?.toString() ?? "N/A"}
          </h1>
        </div>
      </div>

      <Link
        href="/dependency"
        className="mt-2 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
      >
        See Dependencies
      </Link>
    </div>
  );
}

export default DependencySummary;
