import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

export const user_preferences_ext = {
  getFavorites: protectedProcedure.input(z.object({
    userId: z.number()
  })).query(async ({input}) => {
    return await prisma.favorites.findMany({
      where: {
        userId: input.userId
      }
    })
  }),
  addFavorite: protectedProcedure.input(z.object({
    userId: z.number(),
    projectId: z.number()
  })).query(async ({input}) => {
    return await prisma.favorites.create({
      data: {
        userId: input.userId,
        projectId: input.projectId
      }
    })
  }),
  addProjectHistory: protectedProcedure.input(z.object({
    id: z.number()
  })).query(async ({ input, ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    
    // insert or update:
    const upsertResult = await prisma.project_history.upsert({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: input.id
        }
      },
      update: {
        time: new Date()
      },
      create: {
        projectId: input.id,
        userId: user.id,
        time: new Date()
      }
    });

    // calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // delete old project history
    await prisma.project_history.deleteMany({
      where: {
        userId: user.id,
        time: {
          lt: sevenDaysAgo
        }
      }
    });

    return upsertResult;
  }),
}
