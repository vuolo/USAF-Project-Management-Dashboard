import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { expenditure } from "~/types/expenditure";
import type { expenditure_plan } from "~/types/expenditure_plan";
import type { wbs_data } from "~/types/wbs_data";


export const expenditureRouter = createTRPCRouter({
  getExpenditurePlan: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      const expenditureData = await prisma.$queryRaw<expenditure_plan[]>`
        SELECT 
          id,
          expen_funding_date as date,
          expen_projected as Projected, 
          expen_projected_total as "Projected Total",
          expen_actual as Actual,
          expen_actual_total as "Actual Total"
        FROM view_expenditure 
        WHERE project_id=${input.project_id}
        ORDER BY expen_funding_date`;

      const wbsData = await prisma.$queryRaw<wbs_data[]>`
        SELECT 
          id,
          month as date,
          total_price as Projected
        FROM task_resource_table
        WHERE project_id=${input.project_id}
        ORDER BY month`;

      const groupedExpenditureData: Record<string, expenditure_plan> = {};
      expenditureData.forEach((item) => {
        const date = new Date(item.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        groupedExpenditureData[key] = item;
      });

      const groupedWbsData: Record<string, number> = {};
      wbsData.forEach((wbsItem) => {
        const date = new Date(wbsItem.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;  // Key format: YYYY-MM
        groupedWbsData[key] = (groupedWbsData[key] || 0) + Number(wbsItem.Projected);
      });

      const uniqueMonthsList: string[] = [...new Set([...Object.keys(groupedExpenditureData), ...Object.keys(groupedWbsData)])];

      let runningTotal = 0;
      let runningActualTotal = 0; // if properly implemented remove actual total from SQL query as we'll do the calculation here

      const mergedData: expenditure_plan[] = uniqueMonthsList.sort((a, b) => {
        const partsA = a ? a.split("-") : [];
        const partsB = b ? b.split("-") : [];

        if (partsA.length !== 2 || partsB.length !== 2) {
          return 0;  // Handle edge cases
        }

        const dateA = new Date(parseInt(partsA[0]!, 10), parseInt(partsA[1]!, 10) - 1);  // subtract 1 since months are 0-indexed in JavaScript
        const dateB = new Date(parseInt(partsB[0]!, 10), parseInt(partsB[1]!, 10) - 1);

        return dateA.getTime() - dateB.getTime();
      }).map((monthKey) => {
        const parts = monthKey.split("-");
        if (parts.length !== 2) {
          throw new Error(`Invalid monthKey format: ${monthKey}`);
        }

        const [yearPart, monthPart] = parts;

        const year = parseInt(yearPart!, 10);
        const month = parseInt(monthPart!, 10);

        const expenditureForMonth = groupedExpenditureData[monthKey] || {} as expenditure_plan;
        const wbsProjectedForMonth = groupedWbsData[monthKey];

        // Running totals for Projected and Actual
        runningTotal += Number(wbsProjectedForMonth || 0);
        runningActualTotal += Number(expenditureForMonth.Actual || 0);

        return {
          ...expenditureForMonth,
          date: new Date(year, month + 1), // Add one because that will be the projected expenditure after that month, EX september proj expenditure shows the date 10/01
          Projected: wbsProjectedForMonth || expenditureForMonth.Projected,
          "Projected Total": runningTotal,
          Actual: expenditureForMonth.Actual || null,
          "Actual Total": runningActualTotal
        };
      });

      return mergedData;
    }),
  getTotalExpenditure: protectedProcedure
    .input(z.object({ project_ids: z.array(z.number()).optional() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      return (
        // NOTE: This only calculates "Awarded" projects (contract_status = 2)
        (user.user_role === "Admin" || user.user_role === "IPT_Member"
          ? // Select filtered input project_ids if they exist, otherwise select all projects
          input.project_ids && input.project_ids.length > 0
            ? await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_projected ELSE 0 END) as expen_projected,
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_actual ELSE 0 END) as expen_actual,
                SUM(expen_projected) as expen_projected_total
              FROM view_expenditure ve
              JOIN contract_award ca on ve.project_id = ca.project_id
              WHERE ca.contract_status = 2
              -- AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0
              AND ve.project_id IN (${Prisma.join(input.project_ids)})`
            : await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_projected ELSE 0 END) as expen_projected,
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_actual ELSE 0 END) as expen_actual,
                SUM(expen_projected) as expen_projected_total
              FROM view_expenditure ve
              JOIN contract_award ca on ve.project_id = ca.project_id
              WHERE ca.contract_status = 2
              -- AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0
              `
          : // Contractors
          // TODO: add project_id filtering for non-admins
          await prisma.$queryRaw<expenditure[]>`
              SELECT 
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_projected ELSE 0 END) as expen_projected,
                SUM(CASE WHEN DATEDIFF((SELECT CURDATE()), ve.expen_funding_date) >= 0 THEN expen_actual ELSE 0 END) as expen_actual,
                SUM(expen_projected) as expen_projected_total
              FROM view_expenditure ve
              JOIN user_project_link upl on ve.project_id = upl.project_id
              JOIN contract_award ca on upl.project_id = ca.project_id
              JOIN users u on upl.user_id = u.id
              WHERE u.id = ${user.id} AND ca.contract_status = 2
              -- AND (SELECT DATEDIFF((SELECT CURDATE()), ve.expen_funding_date)) >= 0
              `
        ).map((expen) => {
          // Map the query result to numbers (for some reason, the query result is a string)
          return {
            expen_actual: Number(expen.expen_actual || 0),
            expen_projected: Number(expen.expen_projected || 0),
            expen_projected_total: Number(expen.expen_projected_total || 0),
          };
        })[0] || null
      );
    }),
  addExpenditure: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        expen_funding_date: z.date(),
        expen_projected: z.number(),
        expen_actual: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.create({
        data: { ...input },
      });
    }),
  updateExpenditure: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        project_id: z.number(),
        expen_funding_date: z.date(),
        expen_projected: z.number(),
        expen_actual: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  deleteExpenditure: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.expenditure_funding_data.delete({
        where: { id: input.id },
      });
    }),
});
