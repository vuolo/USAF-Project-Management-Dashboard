/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as XLSX from "xlsx";
import { Prisma, type task_resource_table } from "@prisma/client";
import { convertStringToDate_short } from "./date";

export async function processFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsBinaryString(file);
  });
}

// Make sure the file is in the correct format (.xlsx) and contains the correct
// WBS (Work Breakdown Structure) data.
export async function parseProPricerFile(
  file: File,
  project_id: number
): Promise<Partial<task_resource_table>[] | unknown> {
  // Validate file type
  if (
    file.type !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    throw new Error("The file must be an Excel file (.xlsx)");

  const fileContents = await processFile(file);

  // Get the first sheet of the workbook
  const workbook = XLSX.read(fileContents, { type: "binary", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The file must contain a WBS sheet");
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("The file must contain a WBS sheet");

  // Convert the sheet to an array of JSON objects
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Log the columns by getting the header row (first row)
  const headerRow = rows[0] as string[];

  // Validate the header row
  for (const header of headerRow) {
    if (
      header !== "TASK ID" &&
      header !== "Task Description" &&
      header !== "Month" &&
      header !== "WBS" &&
      header !== "CLIN" &&
      header !== "Source Type" &&
      header !== "Resource" &&
      header !== "Resource Description" &&
      header !== "Resource Type" &&
      header !== "Rate" &&
      header !== "Hours" &&
      header !== "Units" &&
      header !== "Cost" &&
      header !== "Base Cost" &&
      header !== "Direct Cost" &&
      header !== "Total Price"
    )
      throw new Error(
        "The WBS sheet is invalid, please make sure it contains the correct columns: \n'TASK ID' (ex. 1.6.1.1.1), 'Task Description', 'Month' (ex. Oct-21), 'WBS' (ex. 1.6.1.1.1), 'CLIN' (ex. 1001), 'Source Type', 'Resource', 'Resource Description', 'Resource Type', 'Rate', 'Hours', 'Units', 'Cost', 'Base Cost', 'Direct Cost', 'Total Price'"
      );
  }

  const wbs = rows.map((row, i) => {
    return {
      project_id,
      // TODO: figure out if we need to add clin_id here... but for now it works!
      task_id: (row as string[])[0] || "",
      task_description: (row as string[])[1] || "",
      month:
        (row as Date[])[2] && i !== 0
          ? (row as Date[])[2] || undefined
          : undefined,
      wbs: (row as string[])[3] || "",
      clin_num: (row as string[])[4] ? Number((row as string[])[4]) : undefined,
      source_type: (row as string[])[5] || "",
      resource_code: (row as string[])[6] || "",
      resource_description: (row as string[])[7] || "",
      resource_type: (row as string[])[8] || "",
      rate: (row as string[])[9] ? Number((row as string[])[9]) : undefined,
      hours_worked: (row as string[])[10]
        ? Number((row as string[])[10])
        : undefined,
      units: (row as string[])[11] ? Number((row as string[])[11]) : undefined,
      cost: (row as string[])[12] ? Number((row as string[])[12]) : undefined,
      base_cost: (row as string[])[13]
        ? Number((row as string[])[13])
        : undefined,
      direct_cost: (row as string[])[14]
        ? Number((row as string[])[14])
        : undefined,
      total_price: (row as string[])[15]
        ? Number((row as string[])[15])
        : undefined,
    } as Partial<task_resource_table>;
  });

  // Remove the header row
  wbs.shift();

  return wbs;
}
