import React, {
  type FC,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

export type FilterTabOption =
  | "Active"
  | "Archived"
  | "All"
  | "Resolved"
  | "Unresolved";

export interface FilterTab {
  name: string;
  count?: number;
}

interface FilterProps {
  filter: string;
  setFilter: Dispatch<SetStateAction<FilterTabOption>>;
  tabs: FilterTab[];
}

const FilterTabs: FC<FilterProps> = ({ filter, setFilter, tabs }) => (
  <div>
    <div className="sm:hidden">
      <label htmlFor="tabs" className="sr-only">
        Select a filter
      </label>
      <select
        id="tabs"
        name="tabs"
        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm"
        defaultValue={tabs.find((tab) => filter === tab.name)?.name || ""}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setFilter(e.target.value as FilterTabOption)
        }
      >
        {tabs.map((tab, index) => (
          <option key={`filter-tab-dropdown-${index}`}>{tab.name}</option>
        ))}
      </select>
    </div>

    <div className="hidden sm:block">
      <div className="border-b border-gray-200">
        <nav
          className="flex space-x-2 rounded-t-md bg-white px-2"
          aria-label="Tabs"
        >
          {tabs.map((tab, index) => (
            <a
              key={`filter-tab-${index}`}
              className={
                filter === tab.name
                  ? "flex cursor-pointer whitespace-nowrap rounded-sm border-b-2 border-brand-dark px-1 py-2 text-sm font-medium text-brand-dark"
                  : "flex cursor-pointer whitespace-nowrap rounded-sm border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 hover:border-gray-200 hover:text-gray-700"
              }
              aria-current={filter === tab.name ? "page" : undefined}
              onClick={() => setFilter(tab.name as FilterTabOption)}
            >
              {tab.name}
              {tab.count !== undefined && (
                <span
                  className={
                    filter === tab.name
                      ? "ml-3 hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-brand-dark md:inline-block"
                      : "ml-3 hidden rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 md:inline-block"
                  }
                >
                  {tab.count}
                </span>
              )}
            </a>
          ))}
        </nav>
      </div>
    </div>
  </div>
);

export default FilterTabs;
