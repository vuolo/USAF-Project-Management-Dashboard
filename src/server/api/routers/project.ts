import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

import type { view_project } from "~/types/view_project";

export const projectRouter = createTRPCRouter({
  list: protectedProcedure.query(async (): Promise<view_project[]> => {
    return await prisma.$queryRaw`SELECT * FROM view_project`;
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.id}`,
      };
    }),
});
