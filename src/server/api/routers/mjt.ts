import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { military_job_titles } from "@prisma/client";

export const mjtRouter = createTRPCRouter({
  getAllNotInUse: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<military_job_titles[]>`
      SELECT * 
      FROM military_job_titles m
      WHERE m.id NOT IN(SELECT DISTINCT(upl.mil_job_title_id)
      FROM user_project_link upl
      WHERE upl.mil_job_title_id IS NOT NULL);`;
  }),
  addTitle: protectedProcedure
    .input(
      z.object({
        mil_job_title: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.military_job_titles.create({ data: { ...input } });
    }),
  removeTitle: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.military_job_titles.delete({
        where: { id: input.id },
      });
    }),
});
