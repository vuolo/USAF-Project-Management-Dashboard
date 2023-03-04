import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const requirementTypeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.requirement_types.findMany();
  }),
});
