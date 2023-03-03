import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { branches } from "@prisma/client";

export const branchRouter = createTRPCRouter({
  getAllWithNoProjects: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<branches[]>`
      SELECT *
      FROM branches b
      WHERE b.id NOT IN(SELECT DISTINCT(p.branch_id) 
      FROM project p
      WHERE p.branch_id IS NOT NULL)`;
  }),
  addBranch: protectedProcedure
    .input(
      z.object({
        branch_name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.branches.create({ data: { ...input } });
    }),
  removeBranch: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.branches.delete({ where: { id: input.id } });
    }),
});
