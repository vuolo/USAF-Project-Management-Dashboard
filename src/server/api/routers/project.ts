import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_project } from "~/types/view_project";

export const projectRouter = createTRPCRouter({
  list_view: protectedProcedure.query(async () => {
    return await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`;
  }),
  get_view: protectedProcedure
    // TODO: select using userId if not admin
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return (
        (
          await prisma.$queryRaw<view_project[]>`
            SELECT * FROM view_project WHERE id = ${input.id} LIMIT 1`
        )[0] || null
      );
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.project.delete({ where: { id: input.id } });
    }),
});
