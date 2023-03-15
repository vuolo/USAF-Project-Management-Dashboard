import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async () => {
    return await prisma.users.findMany();
  }),
  getAllAdminsAndIptMembers: protectedProcedure.query(async () => {
    return await prisma.users.findMany({
      // SELECT * FROM users WHERE user_role = 2 OR user_role = 3
      where: {
        OR: [
          { user_role: { equals: "Admin" } },
          { user_role: { equals: "IPT_Member" } },
        ],
      },
    });
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        user_name: z.string(),
        user_role: z.enum(["Admin", "IPT_Member", "Contractor"]),
        user_email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.project.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  getProjectContractorUsers: protectedProcedure
    .input(z.object({ project_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<users[]>`
        SELECT 
            u.*
        FROM users u
        INNER JOIN user_project_link upl on u.id = upl.user_id
        INNER JOIN view_project vp on vp.id = upl.project_id
        WHERE vp.id = ${input.project_id} AND u.user_role = 1`;
    }),
  getContractorUsers: protectedProcedure
    .input(z.object({ contractor_id: z.number() }))
    .query(async ({ input }) => {
      return await prisma.$queryRaw<users[]>`
        SELECT 
          u.*
        FROM users u 
        INNER JOIN contractor c on c.id = u.contractor_id
        WHERE u.contractor_id = ${input.contractor_id}`;
    }),
  getIptMembers: protectedProcedure
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
  addToUserProjectLink: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        user_id: z.number(),
        mil_job_title_id: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return input.mil_job_title_id !== undefined
        ? await prisma.$executeRaw`
            INSERT INTO user_project_link(
              user_id,
              project_id,
              mil_job_title_id
            ) VALUES (
              ${input.user_id},
              ${input.project_id},
              ${input.mil_job_title_id})`
        : await prisma.$executeRaw`
            INSERT INTO user_project_link(
              user_id,
              project_id
            ) VALUES (
              ${input.user_id},
              ${input.project_id})`;
    }),
  removeFromUserProjectLink: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        user_id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.$executeRaw`
        DELETE FROM user_project_link
        WHERE user_id = ${input.user_id} AND project_id = ${input.project_id}`;
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
