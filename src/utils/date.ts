import type { DayValue } from "@hassanmojab/react-modern-calendar-datepicker";
import { format } from "date-fns";

export const isInvalidDate = (date?: Date | null) => {
  return !date || format(date, "MM/yyyy") === "12/1969";
};

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const convertDayValueToDate = (
  dayValue?: DayValue,
  dayOffset?: number
) => {
  return dayValue
    ? new Date(
        dayValue.year,
        dayValue.month - 1,
        dayValue.day + (dayOffset || 0)
      )
    : undefined;
};

export const convertDateToDayValue = (
  date?: Date | null,
  dayOffset?: number
) => {
  return date
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate() + (dayOffset || 0),
      }
    : undefined;
};

export function convertStringToDate_short(input: string): Date | null {
  // Define a mapping of month names to their numeric values (0-indexed)
  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  // Parse the month and year components from the input string
  const [monthStr, yearStr] = input.split("-");
  if (monthStr === undefined || yearStr === undefined) return null;

  // Get the numeric month value from the mapping
  const month = monthMap[monthStr];

  // Convert the year string to a numeric value
  const year = parseInt(yearStr, 10);

  // Handle parsing errors
  if (month === undefined || isNaN(month) || year === undefined || isNaN(year))
    return null;

  // Create and return a new Date object using the parsed year and month
  // Note: The day is set to 1 by default.
  return new Date(year, month, 1);
}
