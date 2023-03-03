import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { ipt_members } from "~/types/ipt_members";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.users.findMany();
  }),
  getIptMembers: protectedProcedure
    // TODO: select using userId if not admin
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<ipt_members[]>`
      SELECT 
        u.id, 
        mjt.mil_job_title, 
        u.user_name 
      FROM users u 
      INNER JOIN user_project_link upl on upl.user_id = u.id
      INNER JOIN military_job_titles mjt on upl.mil_job_title_id = mjt.id
      WHERE upl.project_id = ${input.project_id} AND upl.mil_job_title_id IS NOT NULL
      ORDER BY upl.mil_job_title_id`;
    }),
  add: protectedProcedure
    .input(
      z.object({
        contractor_id: z.number(),
        user_name: z.string(),
        user_role: z.enum(["Admin", "Contractor", "IPT_Member"]),
        user_email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.users.create({ data: { ...input } });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.users.delete({ where: { id: input.id } });
    }),
});
