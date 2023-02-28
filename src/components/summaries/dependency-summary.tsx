import Link from "next/link";

function DependencySummary() {
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
          <h1 className="pt-4 text-2xl font-medium">2</h1>
        </div>

        {/* Yellow */}
        <div className="h-[8rem] w-40 rounded-sm border border-black bg-[yellow] px-4 py-2 text-center text-black sm:h-[7.5rem]">
          <h3 className="h-16 text-xs sm:h-12">
            Tracked Dependencies With &lt;5 Days Schedule Margin
          </h3>
          <h1 className="pt-4 text-2xl font-medium">1</h1>
        </div>

        {/* Red */}
        <div className="h-[8rem] w-40 rounded-sm border border-black bg-[red] px-4 py-2 text-center text-white sm:h-[7.5rem]">
          <h3 className="h-16 text-xs sm:h-12">
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
  );
}

export default DependencySummary;
