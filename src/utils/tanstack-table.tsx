import { type FilterFn, type ColumnDef } from "@tanstack/react-table";
import TextSkeleton from "~/components/ui/skeletons/text-skeleton";
import { type DataRow } from "~/types/misc";

export const NUM_COLUMN_SKELETONS = 4;
export const NUM_ROW_SKELETONS = 13;

export interface RowData {
  id: string;
  [key: string]: unknown;
}

export const getPsuedoRandomWidth = (index: number): string => {
  let width;
  switch (index % 4) {
    case 0:
      width = "10rem";
      break;
    case 1:
      width = "14rem";
      break;
    case 2:
      width = "7rem";
      break;
    case 3:
    default:
      width = "4rem";
      break;
  }
  return width;
};

export const COLUMN_SKELETONS: ColumnDef<DataRow>[] = Array(
  NUM_COLUMN_SKELETONS
)
  .fill(null)
  .map((_, index) => ({
    header: () => (
      <TextSkeleton
        width={getPsuedoRandomWidth(index)}
        height={"1rem"}
        className="rounded-md bg-gray-300"
      />
    ),
    accessorKey: `row-${index}`,
    cell: (info) => (
      <TextSkeleton
        width={getPsuedoRandomWidth(info.row.index)}
        height={"1rem"}
        className="rounded-md bg-gray-300"
      />
    ),
  }));

export const ROW_SKELETONS: RowData[] = Array(NUM_ROW_SKELETONS)
  .fill(null)
  .map((_, rowIndex) => {
    const row: RowData = { id: `row-${rowIndex}` };
    for (
      let columnIndex = 0;
      columnIndex < NUM_COLUMN_SKELETONS;
      columnIndex++
    ) {
      row[`row-${columnIndex}`] =
        "If you see this, hello there! 👋 - mike vuolo (the og developer)";
    }
    return row;
  });

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const searchQuery = (value as string).toLowerCase().trim();

  const safeValue: string | undefined = (() => {
    const value = row.getValue(columnId);

    return typeof value === "number"
      ? String(value)
      : typeof value === "object"
      ? Object.values(value || {}).join(" ")
      : String(value);
  })();

  const searchWords = searchQuery.split(" ");
  const shouldInclude = searchWords.every((word) =>
    safeValue?.toLowerCase().includes(word)
  );

  return shouldInclude;
};
