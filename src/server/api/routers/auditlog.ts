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
    }).optional(),
    pagination: z.object({
      pageIndex: z.number(),
      pageSize: z.number(),
      cursor: z.number().optional().nullable()
    }).optional()
  })
  ).query(async ({ input }) => {
    if (input.filterQuery && input.filterType === "user_email") {
      return await prisma.auditlog.findMany({
        where: {
          user: {
            contains: input.filterQuery
          }
        },
        orderBy: {
          time: "desc"
        },
        cursor: input.pagination?.cursor ? {
          id: input.pagination?.cursor
        } : undefined,
        take: input.pagination?.pageSize,
        skip: input.pagination?.cursor ? 1 : 0
      });
    }
    else if (input.filterQuery && input.filterType === "endpoint") {
      return await prisma.auditlog.findMany({
        where: {
          endpoint: {
            contains: input.filterQuery
          }
        },
        orderBy: {
          time: "desc"
        },
        cursor: input.pagination?.cursor ? {
          id: input.pagination?.cursor
        } : undefined,
        take: input.pagination?.pageSize,
        skip: input.pagination?.cursor ? 1 : 0
      })
    }
    else if (input.filterType === "time" && input.dateRange) {
      await prisma.auditlog.findMany({
        where: {
          time: {
            lte: new Date(input.dateRange.to.year, input.dateRange.to.month - 1, input.dateRange.to.day),
            gte: new Date(input.dateRange.from.year, input.dateRange.from.month - 1, input.dateRange.from.day)
          }
        },
        orderBy: {
          time: 'desc'
        },
        cursor: input.pagination?.cursor ? {
          id: input.pagination?.cursor
        } : undefined,
        take: input.pagination?.pageSize,
        skip: input.pagination?.cursor ? 1 : 0
      })
    }
    else if (input.filterQuery && input.filterType === "query") {
      return await prisma.auditlog.findMany({
        where: {
          query: {
            contains: input.filterQuery
          }
        },
        orderBy: {
          time: "desc"
        },
        cursor: input.pagination?.cursor ? {
          id: input.pagination?.cursor
        } : undefined,
        take: input.pagination?.pageSize,
        skip: input.pagination?.cursor ? 1 : 0
      })
    }

    // console.log(`cursor: ${input.pagination?.cursor ?? "N/A"}\npageIndex: ${input.pagination?.pageIndex ?? "N/A"}\npageSize: ${input.pagination?.pageSize ?? "N/A"}`);

    return await prisma.auditlog.findMany({
      orderBy: {
        time: "desc"
      },
      cursor: input.pagination?.cursor ? {
        id: input.pagination?.cursor
      } : undefined,
      take: input.pagination?.pageSize,
      skip: input.pagination?.cursor ? 1 : 0
    })
  }),
});
