import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const wbsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ project_id: z.number(), clin_num: z.number() }))
    .query(async ({ input }) => {
      return await prisma.task_resource_table.findMany({
        where: {
          project_id: input.project_id,
          clin_num: input.clin_num,
        },
      });
    }),
});
