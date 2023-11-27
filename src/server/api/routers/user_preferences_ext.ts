import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

export const user_preferences_ext = {
  getFavorites: protectedProcedure.query(async ({ input, ctx }) => {
    const user = ctx.session?.db_user;
    if (!user) return null;

    return await prisma.favorites.findMany({
      where: {
        userId: user.id,
      },
      select: {
        projectId: true,
        userId: true,
        project: {
          select: {
            project_name: true,
          },
        },
      },
    });
  }),
  addFavorite: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user) return null;

      return await prisma.favorites.create({
        data: {
          userId: user.id,
          projectId: input.projectId,
        },
      });
    }),
  removeFavorite: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user) return null;

      return await prisma.favorites.delete({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: input.projectId,
          },
        },
      });
    }),
  getProjectHistory: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.db_user;
    if (!user) return null;

    // calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // delete old project history
    await prisma.project_history.deleteMany({
      where: {
        userId: user.id,
        time: {
          lt: sevenDaysAgo,
        },
      },
    });

    const group = await prisma.project_history.groupBy({
      by: ["projectId"],
      where: {
        userId: user.id,
      },
      _count: {
        projectId: true,
      },
    });

    const groupIds = group.map((x) => x.projectId);

    const projects = await prisma.project.findMany({
      where: {
        id: {
          in: groupIds,
        },
      },
      select: {
        id: true,
        project_name: true,
      },
    });

    return (
      projects
        .map((x) => {
          return {
            ...x,
            count:
              group.find((y) => y.projectId == x.id)?._count.projectId ?? 0,
          };
        })
        // filter out projects with counts < 3
        .filter((x) => x.count >= 3)
    );
  }),
  addProjectHistory: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.db_user;
      if (!user) return null;

      // Create the new entry
      await prisma.project_history.create({
        data: {
          userId: user.id,
          projectId: input.id,
          time: new Date(),
        },
      });

      // calculate the date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // delete old project history
      await prisma.project_history.deleteMany({
        where: {
          userId: user.id,
          time: {
            lt: sevenDaysAgo,
          },
        },
      });
    }),
};
