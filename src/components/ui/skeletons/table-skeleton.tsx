import { type FC } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import TanstackTable from "../tanstack-table";
import {
  COLUMN_SKELETONS,
  ROW_SKELETONS,
  fuzzyFilter,
} from "~/utils/tanstack-table";

const TableSkeleton: FC = () => (
  <TanstackTable
    table={useReactTable({
      columns: COLUMN_SKELETONS,
      data: ROW_SKELETONS,
      getCoreRowModel: getCoreRowModel(),
      filterFns: {
        fuzzy: fuzzyFilter,
      },
    })}
    customWidth="w-full"
  />
);

export default TableSkeleton;
