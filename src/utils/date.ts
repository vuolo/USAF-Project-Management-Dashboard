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

export const convertDayValueToDate = (dayValue?: DayValue) => {
  return dayValue
    ? new Date(dayValue.year, dayValue.month - 1, dayValue.day)
    : undefined;
};

export const convertDateToDayValue = (date?: Date | null) => {
  return date
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }
    : undefined;
};
