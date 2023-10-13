import React, { type FC, useEffect, useRef, useState } from "react";
import { flexRender, type Table } from "@tanstack/react-table";
import { classNames } from "~/utils/misc";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ArrowUpWideNarrowIcon,
  CircleSlash2Icon,
} from "lucide-react";
import TableSkeleton from "./skeletons/table-skeleton";
import type { Icon } from "~/types/misc";

interface TableProps {
  table: Table<any>;
  isLoading?: boolean;
  customWidth?: string;
  autoResizeWidth?: boolean;
  tableFor?: string;
  NothingToDisplayIcon?: Icon;
}

const TanstackTable: FC<TableProps> = ({
  table,
  isLoading,
  customWidth,
  autoResizeWidth,
  tableFor,
  NothingToDisplayIcon,
}) => {
  const parentContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [parentWidth, setParentWidth] = useState(0);
  const [tableWidth, setTableWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState("w-0");
  const [refLoaded, setRefLoaded] = useState(false);

  useEffect(() => {
    if (parentContainerRef.current && tableRef.current) setRefLoaded(true);
  }, [parentContainerRef.current, tableRef.current]);

  useEffect(() => {
    if (!autoResizeWidth) return;
    const computeAndLogWidth = () => {
      const parentNode = parentContainerRef.current
        ?.parentNode as HTMLElement | null;
      const tableNode = tableRef.current;
      if (parentNode && tableNode) {
        const computedParentWidth =
          window.innerWidth -
          parentNode.getBoundingClientRect().left -
          14; /* subtract 14 to account for right padding (better safe, than sorry, also.) */
        const computedTableWidth = tableNode.offsetWidth;
        setParentWidth(computedParentWidth);
        setTableWidth(computedTableWidth);
      }
    };
    if (refLoaded) {
      computeAndLogWidth();

      window.addEventListener("resize", computeAndLogWidth);
      const intervalId = setInterval(computeAndLogWidth, 1000);

      return () => {
        window.removeEventListener("resize", computeAndLogWidth);
        clearInterval(intervalId);
      };
    }
  }, [refLoaded, autoResizeWidth]);

  useEffect(() => {
    if (!autoResizeWidth) return;
    if (tableWidth < parentWidth) setContainerWidth("w-full");
    else if (tableWidth >= parentWidth) setContainerWidth("w-0");
  }, [parentWidth, tableWidth, autoResizeWidth]);

  return isLoading ? (
    <TableSkeleton />
  ) : (
    <div
      ref={parentContainerRef}
      className={classNames(
        "sticky px-4 sm:px-6 lg:px-8",
        autoResizeWidth
          ? containerWidth
          : table.getHeaderGroups()[0]?.headers.length === 1
          ? "w-full"
          : customWidth ?? "w-0"
      )}
    >
      <div className="flex flex-col">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div
            className={classNames(
              "inline-block min-w-full py-2 align-middle",
              autoResizeWidth ? (containerWidth === "w-0" ? " pr-4" : "") : ""
            )}
          >
            <table
              ref={tableRef}
              className="shadow-primary min-w-full border-separate rounded-md border-b-0 border-t-0 border-border-primary"
              style={{ borderSpacing: 0 }}
            >
              <thead className="sticky top-0 z-10 rounded-t-md bg-gray-100">
                {table.getHeaderGroups().map((headerGroup, groupIdx) =>
                  headerGroup.id === "data" ? null : (
                    <tr
                      key={headerGroup.id}
                      className={classNames(
                        groupIdx === 0 ? "rounded-t-md" : ""
                      )}
                    >
                      {headerGroup.headers.map((header, headerIdx) =>
                        header.id === "data" ? null : (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className={classNames(
                              "z-10 whitespace-nowrap border-b border-t border-border-primary px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
                              headerIdx === 0
                                ? "rounded-tl-md"
                                : headerIdx ===
                                  headerGroup.headers.length -
                                    (headerGroup.headers.some(
                                      (header) => header.id === "data"
                                    )
                                      ? 2
                                      : 1)
                                ? "rounded-tr-md"
                                : "",
                              headerIdx ===
                                headerGroup.headers.length -
                                  (headerGroup.headers.some(
                                    (header) => header.id === "data"
                                  )
                                    ? 2
                                    : 1)
                                ? "border-r-0"
                                : ""
                            )}
                            style={{
                              position: "relative",
                              width: header.getSize(),
                            }}
                          >
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                              {{
                                asc: (
                                  <div className="mt-4 flex items-center justify-center space-x-2">
                                    <h1>Sort:</h1>
                                    <ArrowUpNarrowWideIcon className="h-4 w-4" />
                                  </div>
                                ),
                                desc: (
                                  <div className="mt-4 flex items-center justify-center space-x-2">
                                    <h1>Sort:</h1>
                                    <ArrowDownWideNarrowIcon className="h-4 w-4" />
                                  </div>
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>

                            {autoResizeWidth &&
                              containerWidth === "w-full" &&
                              header.column.getCanResize() && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`resizer ${
                                    header.column.getIsResizing()
                                      ? "isResizing"
                                      : ""
                                  }`}
                                ></div>
                              )}
                          </th>
                        )
                      )}
                    </tr>
                  )
                )}
              </thead>
              <tbody className="rounded-b-md">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getHeaderGroups()[0]?.headers.length}
                      className="bg-white p-10 text-center text-gray-600"
                    >
                      <div className="-mr-3 flex items-center justify-center space-x-2">
                        {NothingToDisplayIcon ? (
                          <NothingToDisplayIcon className="h-5 w-5 text-gray-700" />
                        ) : (
                          <CircleSlash2Icon className="h-5 w-5 text-gray-700" />
                        )}
                        <span className="text-sm italic text-gray-900">
                          No {tableFor ?? "rows"} to display...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, rowIndex) => (
                    <tr
                      key={row.id}
                      className={classNames(
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIdx) =>
                        cell.column.id === "data" ? null : (
                          <td
                            key={cell.id}
                            className={classNames(
                              "whitespace-nowrap border-b border-border-primary px-3 py-4 text-sm text-black",
                              cellIdx !==
                                row.getVisibleCells().length -
                                  (row
                                    .getVisibleCells()
                                    .some((cell) => cell.column.id === "data")
                                    ? 2
                                    : 1)
                                ? "border-r"
                                : "",
                              rowIndex ===
                                table.getRowModel().rows.length - 1 &&
                                cellIdx === 0
                                ? "rounded-bl-md"
                                : "",
                              rowIndex ===
                                table.getRowModel().rows.length - 1 &&
                                cellIdx ===
                                  row.getVisibleCells().length -
                                    (row
                                      .getVisibleCells()
                                      .some((cell) => cell.column.id === "data")
                                      ? 2
                                      : 1)
                                ? "rounded-br-md"
                                : ""
                            )}
                            style={{ width: cell.column.getSize() }}
                          >
                            {cell.getValue() ? (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            ) : (
                              <span className="text-gray-500">...</span>
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TanstackTable;
