import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { contractor } from "@prisma/client";

export const contractorRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.contractor.findMany();
  }),
  getAllWithNoProjects: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<contractor[]>`
      SELECT * 
      FROM contractor c
      WHERE c.id NOT IN(
        SELECT DISTINCT(p.contractor_id) 
        FROM project p 
        WHERE p.contractor_id IS NOT NULL)`;
  }),
  addContractor: protectedProcedure
    .input(
      z.object({
        contractor_name: z.string(),
        summary: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.contractor.create({ data: { ...input } });
    }),
  removeContractor: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.contractor.delete({ where: { id: input.id } });
    }),
});
