import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_clin } from "~/types/view_clin";
import type { wbs } from "~/types/wbs";

export const clinRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<view_clin[]>`
      SELECT * 
      FROM view_clin
      ORDER BY clin_num
    `;
  }),
  get: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<view_clin[]>`
        SELECT * 
        FROM view_clin
        WHERE project_id = ${input.project_id}
        ORDER BY clin_num
      `;
    }),
  add: protectedProcedure
    .input(
      z.object({
        clin_num: z.number(),
        project_id: z.number(),
        clin_type: z.string(),
        clin_scope: z.string(),
        ind_gov_est: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        INSERT INTO clin_data (
          clin_num,
          project_id,
          clin_type,
          clin_scope, 
          ind_gov_est) 
        VALUES (
          ${input.clin_num},
          ${input.project_id},
          ${input.clin_type},
          ${input.clin_scope},
          ${input.ind_gov_est})`;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        clin_num: z.number(),
        project_id: z.number(),
        clin_type: z.string(),
        clin_scope: z.string(),
        ind_gov_est: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        UPDATE clin_data 
        SET 
          clin_num = ${input.clin_num},
          project_id = ${input.project_id},
          clin_type = ${input.clin_type},
          clin_scope = ${input.clin_scope},
          ind_gov_est = ${input.ind_gov_est}
        WHERE id = ${input.id}`;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        DELETE FROM clin_data 
        WHERE id = ${input.id}`;
    }),
  updateProjFromClin: protectedProcedure
  .input(z.object({ project_id: z.number() }))
  .mutation(async ({ input }) => {
    // Get WBS data, Group by month, and sort it
    const wbsData = await prisma.$queryRaw<wbs[]>`
      SELECT 
        id,
        month as date,
        total_price as Projected
      FROM task_resource_table
      WHERE project_id=${input.project_id}
      ORDER BY month
    `;
    
    const groupedWbsData: Record<string, number> = {};
    wbsData.forEach((wbsItem) => {
      const date = new Date(wbsItem.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;  // Key format: YYYY-MM
      groupedWbsData[key] = (groupedWbsData[key] || 0) + Number(wbsItem.Projected);
    });

    const sortedGroupedWbsDataArray = Object.entries(groupedWbsData).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
  
    // Store the actual expenditure data
    const actualExpenditureData = await prisma.expenditure_funding_data.findMany({
      where: {
        project_id: input.project_id,
      }
    });

     // Delete all existing data for that project
     await prisma.expenditure_funding_data.deleteMany({
      where: {
        project_id: input.project_id,
      }
    });

    // Upload Expenditure data
    const uploadToExpenditure = async (project_id: number, sortedWbsData: [string, number][]) => {
      for (const [key, value] of sortedWbsData) {
        const [year, month] = key.split('-').map(Number);

        if (!year || !month) {
          console.warn(`Invalid key format encountered: ${key}. Skipping.`);
          continue;
        }

        const expen_funding_date = new Date(year, month - 1, 15); 

        // Find the actual expenditure for that month, if it exists
        const actualForMonth = actualExpenditureData.find(item => {
          const date = new Date(item.expen_funding_date);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        });

        const expen_actual = actualForMonth ? actualForMonth.expen_actual : null;

        await prisma.expenditure_funding_data.create({
          data: {
            project_id,
            expen_funding_date,
            expen_projected: value,
            expen_actual: expen_actual
          }
        });
      }
    }


    await uploadToExpenditure(input.project_id, sortedGroupedWbsDataArray);
  }),
});
