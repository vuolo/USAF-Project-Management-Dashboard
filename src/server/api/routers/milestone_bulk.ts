import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { NewMilestone } from "~/types/milestone";
import { generateNumberFromAlphaId } from "~/utils/misc";

export const milestonebulk_ext = {
  bulkAddMilestones: protectedProcedure
    .input(
      z.object({
        milestones: z.array(z.any()), // Ideally, replace z.any() with a more specific schema
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newMilestones = input.milestones as NewMilestone[];
      const projectIds = Array.from(
        new Set(newMilestones.map((m) => m.project_id))
      );

      // Fetch existing milestone IDs for the project
      const existingMilestones = await prisma.project_milestones.findMany({
        where: {
          project_id: {
            in: projectIds,
          },
        },
        select: {
          id: true,
        },
      });
      const existingIds = existingMilestones.map((m) => m.id);

      // Bulk add all milestones
      await prisma.project_milestones.createMany({
        data: newMilestones.map((milestone) => ({
          project_id: milestone.project_id,
          task_name: milestone.Name,
          start_date: milestone.ProjectedStart,
          end_date: milestone.ProjectedEnd,
          actual_start: milestone.ActualStart,
          actual_end: milestone.ActualEnd,
        })),
      });

      // Refetch all milestone IDs for the project
      const allMilestones = await prisma.project_milestones.findMany({
        where: {
          project_id: {
            in: projectIds,
          },
        },
      });
      const allIds = allMilestones.map((m) => m.id);

      // TO CREATE NEW MILESTONE LIST:
      // 1. For loop new milestones
      // 2. When adding predecessors, look at alpha id, if id = 'a' then the predecessor will be new milestone index 0

      // Identify new milestone IDs
      const newIds = allIds.filter((id) => !existingIds.includes(id));

      // Create new milestone list
      const createdMilestones = allMilestones.filter((m) =>
        newIds.includes(m.id)
      );

      // Bulk add all dependencies (now that we have the new IDs)
      for (const newMilestone of newMilestones) {
        const createdMilestone =
          createdMilestones[generateNumberFromAlphaId(newMilestone.alphaId)];
        if (!createdMilestone) continue;

        const dependencies = newMilestone.Predecessors.split(",")
          .map((pId) => {
            const predecessorMilestoneId = pId.trim();
            const predecessorMilestone = allMilestones.find(
              (p) =>
                p.id ===
                (isNaN(Number(predecessorMilestoneId))
                  ? // If it's an alpha ID: we need to find which created milestone it corresponds to (same index of createdMilestones and newMilestones)
                    createdMilestones[
                      generateNumberFromAlphaId(predecessorMilestoneId)
                    ]?.id
                  : Number(predecessorMilestoneId))
            );
            if (!predecessorMilestone) return undefined;

            return {
              predecessor_project: createdMilestone.project_id,
              predecessor_milestone: predecessorMilestone.id,
              successor_project: createdMilestone.project_id,
              successor_milestone: createdMilestone.id,
            };
          })
          .filter(Boolean) as {
          predecessor_project: number;
          predecessor_milestone: number;
          successor_project: number;
          successor_milestone: number;
        }[];

        for (const dependency of dependencies) {
          await prisma.$executeRaw`
            INSERT INTO project_milestone_dependency (
              predecessor_project, 
              predecessor_milestone,
              successor_project,
              successor_milestone) 
            VALUES (
              ${dependency.predecessor_project},
              ${dependency.predecessor_milestone},
              ${dependency.successor_project},
              ${dependency.successor_milestone})`;
        }
      }

      // // let newMilestones = some kind of array
      // for (let i = 0; i < newMilestones.length(); i++) {
      //   // Add the new milestone to the array
      //   await prisma.project_milestones.create({
      //     data: {
      //       // This stuff
      //     },
      //   });
      // }

      // For loop the new milestones
      // Add milestone predecessor based off newMilestone[generateNumberFromAlphaId(newMilestone)]
    }),
};
