import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

export const user_preferences_ext = {
  getFavorites: protectedProcedure.query(async ({input, ctx}) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    return await prisma.favorites.findMany({
      where: {
        userId: user.id
      },
      select: {
        projectId: true,
        userId: true,
        project: {
          select: {
            project_name: true
          }
        }
      }
    })
  }),
  addFavorite: protectedProcedure.input(z.object({
    projectId: z.number()
  })).mutation(async ({input, ctx}) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    return await prisma.favorites.create({
      data: {
        userId: user.id,
        projectId: input.projectId
      }
    })
  }),
  removeFavorite: protectedProcedure.input(z.object({
    projectId: z.number()
  })).mutation(async ({input, ctx}) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return await prisma.favorites.delete({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: input.projectId
        }
      }
    })
    
  }),
  getProjectHistory: protectedProcedure.query(async ({ctx}) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return await prisma.project.findMany({
      where: {
        project_history: {
          userId: user.id
        }
      }
    })
  }),
  addProjectHistory: protectedProcedure.input(z.object({
    id: z.number()
  })).mutation(async ({ input, ctx }) => {
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
