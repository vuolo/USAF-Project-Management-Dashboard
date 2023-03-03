import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const fundingTypeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.funding_types.findMany({
      where: {
        status: true,
      },
    });
  }),
  addFundingType: protectedProcedure
    .input(
      z.object({
        funding_type: z.string(),
        status: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.funding_types.create({ data: { ...input } });
    }),
  deactivateFundingType: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.funding_types.update({
        where: { id: input.id },
        data: { status: false },
      });
    }),
});
