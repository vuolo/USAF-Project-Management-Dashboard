import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { auditlog, users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

export const auditlogRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.auditlog.findMany();
  }),
  search: protectedProcedure.input(z.object({
    filterQuery: z.string().optional(),
    filterType: z.enum(["user_email", "endpoint", "succeeded", "time", "query"])
  })
  ).query(async ({input}) => {
    return input.filterQuery && input.filterType === "user_email" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.user LIKE ${"%" + input.filterQuery + "%"}` :

      input.filterQuery && input.filterType === "endpoint" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.endpoint LIKE ${"%" + input.filterQuery + "%"}` :

      //input.filterQuery && input.filterType === "succeeded" ? await prisma.$queryRaw<auditlog[]>`
        //SELECT a.* from auditlog a WHERE a.succeeded LIKE ${"%" + input.filterQuery + "%"}` :

      //input.filterQuery && input.filterType === "time" ? await prisma.$queryRaw<auditlog[]>`
        //SELECT a.* from auditlog a WHERE a.time LIKE ${"%" + input.filterQuery + "%"}` :

      input.filterQuery && input.filterType === "query" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.query LIKE ${"%" + input.filterQuery + "%"}` :

      await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a`
  }),
});
