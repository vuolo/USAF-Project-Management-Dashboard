import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";
import { view_project } from "~/types/view_project";
import { getIPTMembers } from "~/utils/iptMembers";

export const project_ext = {
  getProjectsWithUpcomingDueMilestones: protectedProcedure.input(z.object({
    days: z.number().optional().default(7),
    favorites: z.boolean().optional()
  })).query(async ({input, ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    
    let currentDate = new Date();
    let nextDate = new Date();
    nextDate.setDate(currentDate.getDate() + input.days);

    const projects = await prisma.project.findMany({
      where: {
        project_milestones: {
          some: {
            end_date: {
              gte: currentDate,
              lte: nextDate
            }
          }
        },
        favorites: input.favorites ? {
          some: {
            userId: user.id
          }
        } : undefined,
      },
      select: {
        id: true,
        project_name: true,
        project_milestones: true,
      },
    })

    // Return the projects with milestones that are within the next 7 days
    return await projects.filter(async (project) => {
      const iptMembers = await getIPTMembers(project.id);
      const isMember = iptMembers.find(member => member.id === user.id);
      return isMember;
    }).map((project) => {
      return {
        ...project,
        project_milestones: project.project_milestones.filter((milestone) => {
          if (!milestone.end_date) return false;
          return milestone.end_date >= currentDate && milestone.end_date <= nextDate;
        })
      }
    })
  })
}
