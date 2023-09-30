import type { milestone } from "~/types/milestone";
import type { all_successors } from "~/types/all_successors";
import { sleep } from "./misc";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Augt",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface DisplayTodayLineProps {
  milestoneSchedules?: milestone[] | null;
  all_successors?: all_successors[] | null;
}

// Display a "Today" vertical line on the Gantt chark (hacky way to do it)
export const displayTodayLine = ({
  milestoneSchedules,
  all_successors,
}: DisplayTodayLineProps) => {
  // If there are no milestones or all_successors, don't do anything
  if (
    (!all_successors || all_successors.length === 0) &&
    (!milestoneSchedules || milestoneSchedules.length === 0)
  )
    return;

  // Get the earliest and latest milestone dates (depending on whether we received milestoneSchedules or all_successors)
  let earliestMilestoneStartDate: Date | null = null;
  let latestMilestoneEndDate: Date | null = null;

  // If we received milestoneSchedules, use those to calculate the earliest and latest milestone dates
  if (milestoneSchedules && milestoneSchedules.length > 0) {
    // Get the earliest actual/projected start date (make sure its the earliest date in the milestone schedule)
    earliestMilestoneStartDate = milestoneSchedules.reduce(
      (earliestDate: Date | null, currentMilestone: milestone) => {
        // Choose either ActualStart or ProjectedStart, whichever is earlier and not in 1969, for the current milestone.
        const currentEarliest =
          currentMilestone.ActualStart &&
          currentMilestone.ActualStart.getFullYear() !== 1969
            ? currentMilestone.ActualStart
            : currentMilestone.ProjectedStart &&
              currentMilestone.ProjectedStart.getFullYear() !== 1969
            ? currentMilestone.ProjectedStart
            : null;

        // If this is the first iteration, or if the current milestone's start date is earlier than the earliest seen so far,
        // update earliestDate.
        return !earliestDate ||
          (currentEarliest && currentEarliest < earliestDate)
          ? currentEarliest
          : earliestDate;
      },
      null
    );

    // Get the latest actual/projected end date
    latestMilestoneEndDate = milestoneSchedules.reduce(
      (latestDate: Date | null, currentMilestone: milestone) => {
        // Choose either ActualEnd or ProjectedEnd, whichever is later and not in 1969, for the current milestone.
        const currentLatest =
          currentMilestone.ActualEnd &&
          currentMilestone.ActualEnd.getFullYear() !== 1969
            ? currentMilestone.ActualEnd
            : currentMilestone.ProjectedEnd &&
              currentMilestone.ProjectedEnd.getFullYear() !== 1969
            ? currentMilestone.ProjectedEnd
            : null;

        // If this is the first iteration, or if the current milestone's end date is later than the latest seen so far,
        // update latestDate.
        return !latestDate || (currentLatest && currentLatest > latestDate)
          ? currentLatest
          : latestDate;
      },
      null
    );
  }
  // If we received all_successors, use those to calculate the earliest and latest milestone dates
  else if (all_successors && all_successors.length > 0) {
    // Get the earliest actual/projected start date (make sure its the earliest date in the milestone schedule)
    earliestMilestoneStartDate = all_successors.reduce(
      (earliestDate: Date | null, currentMilestone: all_successors) => {
        // Choose either ActualStart or ProjectedStart, whichever is earlier and not in 1969, for the current milestone.
        const currentEarliest =
          currentMilestone.pred_actual_start &&
          currentMilestone.pred_actual_start.getFullYear() !== 1969
            ? currentMilestone.pred_actual_start
            : currentMilestone.pred_proj_start &&
              currentMilestone.pred_proj_start.getFullYear() !== 1969
            ? currentMilestone.pred_proj_start
            : null;

        // If this is the first iteration, or if the current milestone's start date is earlier than the earliest seen so far,
        // update earliestDate.
        return !earliestDate ||
          (currentEarliest && currentEarliest < earliestDate)
          ? currentEarliest
          : earliestDate;
      },
      null
    );

    // Get the latest actual/projected end date
    latestMilestoneEndDate = all_successors.reduce(
      (latestDate: Date | null, currentMilestone: all_successors) => {
        // Choose either ActualEnd or ProjectedEnd, whichever is later and not in 1969, for the current milestone.
        const currentLatest =
          currentMilestone.succ_actual_end &&
          currentMilestone.succ_actual_end.getFullYear() !== 1969
            ? currentMilestone.succ_actual_end
            : currentMilestone.succ_proj_end &&
              currentMilestone.succ_proj_end.getFullYear() !== 1969
            ? currentMilestone.succ_proj_end
            : null;

        // If this is the first iteration, or if the current milestone's end date is later than the latest seen so far,
        // update latestDate.
        return !latestDate || (currentLatest && currentLatest > latestDate)
          ? currentLatest
          : latestDate;
      },
      null
    );
  }

  // If there are no actual/projected start/end dates, don't do anything
  if (!earliestMilestoneStartDate || !latestMilestoneEndDate) return;

  // Check whether today is within the range of the earliest and latest milestone's dates
  const today = new Date();
  if (today < earliestMilestoneStartDate || today > latestMilestoneEndDate)
    return;

  // Get today's month name
  const curMonthName = MONTH_NAMES[new Date().getMonth()];
  if (!curMonthName) return;

  // Count how many months with the same name as today's month name are in the range of the earliest and latest milestone's dates
  let numMonths = 0;
  let todaysMonthNum = null;
  const cursorDate = new Date(earliestMilestoneStartDate);
  while (cursorDate <= latestMilestoneEndDate) {
    if (MONTH_NAMES[cursorDate.getMonth()] === curMonthName) {
      numMonths++;

      // Check if cursorDate is in the same month and year as today, and if todaysMonthNum hasn't been set yet
      if (
        cursorDate.getMonth() === new Date().getMonth() &&
        cursorDate.getFullYear() === new Date().getFullYear() &&
        todaysMonthNum === null
      ) {
        todaysMonthNum = numMonths;
      }
    }

    // Move cursorDate to the next month
    cursorDate.setMonth(cursorDate.getMonth() + 1);
  }
  if (todaysMonthNum === null) return;

  void (async () => {
    while (true) {
      await sleep(100);
      // Check if the chart already has a "today" line
      const todayLine = document?.querySelector("#today-line");
      if (todayLine) continue;

      // Find the chart element (id="reactgooglegraph-1", where -1 is variable)
      let chartElement;
      while (!chartElement) {
        chartElement = document.querySelector(
          `[id^="reactgooglegraph-"]`
        ) as HTMLElement;
        await sleep(100);
      }

      // Find the first <text> element with a month name (Sep, Dec, Oct, etc.) in it that matches today's month name.
      const curMonthTextElements: SVGTextElement[] = [];
      while (curMonthTextElements.length === 0) {
        const allTextElements = chartElement.querySelectorAll("text");
        allTextElements.forEach((el) => {
          if (el.textContent?.includes(curMonthName))
            curMonthTextElements.push(el);
        });
        await sleep(100);
      }

      // Assign the correct month name text element to today's month name
      const curMonthTextElement =
        // If there an accurate number of month name text elements, use the last one
        numMonths === curMonthTextElements.length
          ? curMonthTextElements[todaysMonthNum - 1]
          : // Otherwise, we are in a special case where today's month name is not visible on the chart (probably at the beginning or end of the chart)
            // In this case, we would ideally perform some calculations to find the spot to place the "today" line, but for now we will just not draw the line.
            null;
      if (!curMonthTextElement) continue;

      // Clear all existing "today" lines
      const allTodayLines = document?.querySelectorAll("#today-line");
      if (allTodayLines) allTodayLines.forEach((el) => el.remove());

      // Get the x position of the month name text element
      const xPositionForTodaysMonthStr = curMonthTextElement.getAttribute("x");
      if (!xPositionForTodaysMonthStr) continue;
      const xPositionForTodaysMonth = parseFloat(xPositionForTodaysMonthStr);
      if (isNaN(xPositionForTodaysMonth)) continue;

      // Get the x position of the subsequent month name text element
      const xPositionForNextMonthStr =
        curMonthTextElement.nextElementSibling?.getAttribute("x") ??
        chartElement.getAttribute("width");
      if (!xPositionForNextMonthStr) continue;
      const xPositionForNextMonth = parseFloat(xPositionForNextMonthStr);
      if (isNaN(xPositionForNextMonth)) continue;

      // Get the total number of days in the current month
      const dayOfMonth = new Date().getDate();
      const totalDaysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();

      // Calculate the x position for today's line based on the x positions of the month name text elements
      const xPositionForToday =
        xPositionForTodaysMonth +
        (xPositionForNextMonth - xPositionForTodaysMonth) *
          (dayOfMonth / totalDaysInMonth);

      // Draw a vertical line at xPositionForToday using pure JS.
      const svg = chartElement.querySelector("svg");
      if (!svg) continue;

      // Make all elements in the SVG have a z-index of 10 so the line is behind them
      const allSvgElements = svg.querySelectorAll<HTMLElement>("*");
      allSvgElements.forEach((el) => {
        el.style.zIndex = "10";
      });

      // Create a new line element
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("id", "today-line");
      line.setAttribute("x1", xPositionForToday.toString());
      line.setAttribute("y1", "0");
      line.setAttribute("x2", xPositionForToday.toString());
      line.setAttribute("y2", `calc(100% - ${all_successors ? "45" : "55"}px)`);
      line.setAttribute("stroke", "#b91c1c"); // Color of the line
      line.setAttribute("stroke-width", "2"); // Width of the line
      line.style.zIndex = "1";

      // Append the line to the SVG (place it RIGHT AFTER the month name text element's parent)
      curMonthTextElement.parentElement?.insertAdjacentElement(
        "afterend",
        line
      );
    }
  })();
};
