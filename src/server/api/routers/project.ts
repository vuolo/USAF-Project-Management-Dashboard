import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_project } from "~/types/view_project";

export const projectRouter = createTRPCRouter({
  list_view: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`;
  }),
  get: protectedProcedure
    // TODO: select using userId if not admin
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.project.findUnique({
        where: { id: input.id },
      });
    }),
});
