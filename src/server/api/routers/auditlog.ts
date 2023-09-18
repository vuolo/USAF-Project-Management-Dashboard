import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { auditlog, users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";
import { DayRange } from "@hassanmojab/react-modern-calendar-datepicker";

export const auditlogRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.auditlog.findMany();
  }),
  search: protectedProcedure.input(z.object({
    filterQuery: z.string().optional(),
    filterType: z.enum(["user_email", "endpoint", "succeeded", "time", "query"]),
    dateRange: z.object({
      from: z.object({
        year: z.number(),
        month: z.number(),
        day: z.number()
      }),
      to: z.object({
        year: z.number(),
        month: z.number(),
        day: z.number()
      })
    }).optional()
  })
  ).query(async ({input}) => {
    return input.filterQuery && input.filterType === "user_email" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.user LIKE ${"%" + input.filterQuery + "%"} ORDER BY a.time DESC` :

      input.filterQuery && input.filterType === "endpoint" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.endpoint LIKE ${"%" + input.filterQuery + "%"} ORDER BY a.time DESC` :

      //input.filterQuery && input.filterType === "succeeded" ? await prisma.$queryRaw<auditlog[]>`
        //SELECT a.* from auditlog a WHERE a.succeeded LIKE ${"%" + input.filterQuery + "%"}` :
        
      input.filterType === "time" && input.dateRange ? await prisma.auditlog.findMany({
        where: {
          time: {
            lte: new Date(input.dateRange.to.year, input.dateRange.to.month - 1, input.dateRange.to.day),
            gte: new Date(input.dateRange.from.year, input.dateRange.from.month - 1, input.dateRange.from.day)
          }
        },
        orderBy: {
          time: 'desc'
        }
      }) :

      input.filterQuery && input.filterType === "query" ? await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a WHERE a.query LIKE ${"%" + input.filterQuery + "%"} ORDER BY a.time DESC` :

      await prisma.$queryRaw<auditlog[]>`
        SELECT a.* from auditlog a ORDER BY a.time DESC`
  }),
});
