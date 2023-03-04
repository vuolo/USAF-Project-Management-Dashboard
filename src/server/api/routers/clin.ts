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
});
