import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { api } from "~/utils/api";
import { formatDependencies } from "~/utils/format_dependencies";
import { classNames } from "~/utils/misc";

function DependencySummary({ includeButton = true }) {
  const { data: greenDependencies } = api.dependency.getGreenAsDependencies.useQuery();
  const { data: yellowDependencies } = api.dependency.getYellowAsDependencies.useQuery();
  const { data: redDependencies } = api.dependency.getRedAsDependencies.useQuery();

  return (
    <div className="rounded-md bg-white pb-6 text-center shadow-md">
      <div className="rounded-t-md bg-brand-dark px-8 py-2 text-center font-medium text-white">
        <h1>Dependency Summary</h1>
      </div>

      <div className="w-full sm:min-w-[35rem] items-center justify-between gap-6 px-8 pt-4 pb-6">
        <h1 className= "flex italic">Tracked Dependencies with...</h1>
        {/* Green */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[green] px-2 py-1 text-sm font-normal text-white hover:bg-green-600 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>&gt;5 Days Schedule Margin</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{greenDependencies?.length ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatDependencies(greenDependencies)}
                  </Disclosure.Panel>
                </>
              )}
          </Disclosure>
        </div>

        {/* Yellow */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[yellow] px-2 py-1 text-sm font-normal text-black hover:bg-yellow-300 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>&lt;5 Days Schedule Margin</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{yellowDependencies?.length ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatDependencies(yellowDependencies)}
                  </Disclosure.Panel>
              </>
              )}
          </Disclosure>
        </div>

        {/* Red */}
        <div className="mt-4">
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className={
                    classNames(
                      "flex w-full justify-between items-center border-black border shadow-sm bg-[red] px-2 py-1 text-sm font-normal text-white hover:bg-red-600 focus:outline-none focus-visible:ring",
                      open ? "rounded-t-md" : "rounded-md"
                    )
                  }>
                    <span>Tracked Impacts</span>
                    <div className="flex items-center space-x-1">
                      <span className="justify-end font-bold">{redDependencies?.length ?? "N/A"}</span>
                      {open ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="flex flex-col border-b border-x border-black rounded-b-md bg-white overflow-hidden">
                    {formatDependencies(redDependencies)}
                  </Disclosure.Panel>
              </>
              )}
          </Disclosure>
        </div>
      </div>

      {includeButton && (
        <Link
          href="/dependencies"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-brand-dark bg-white px-4 py-2 text-sm font-medium text-brand-dark shadow-sm hover:bg-brand-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-dark focus:ring-offset-2 sm:w-auto"
        >
          See Dependencies
        </Link>
      )}
    </div>
  );
}

export default DependencySummary;
