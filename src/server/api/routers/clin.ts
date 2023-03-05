import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_clin } from "~/types/view_clin";

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
});
