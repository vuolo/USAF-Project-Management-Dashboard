import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { users } from "@prisma/client";
import type { ipt_members } from "~/types/ipt_members";
import { getIPTMembers } from "~/utils/iptMembers";
import { sendEmail } from "~/utils/email";
import { user_preferences_ext } from "./user_preferences_ext";

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
  searchByName: protectedProcedure.input(z.object({
    search: z.string()
  })
  ).query(async ({input}) => {
    return await prisma.$queryRaw<(users & { contractor_name: string })[]>`
      SELECT u.*, c.contractor_name from users u 
      LEFT JOIN contractor c 
      ON u.contractor_id = c.id
      WHERE u.user_name LIKE ${"%" + input.search + "%"}`
  }),
  search: protectedProcedure.input(z.object({
    filterQuery: z.string().optional(),
    filterType: z.enum(["user_name", "user_email", "user_role", "contractor_name"])
  })
  ).query(async ({input}) => {
    return input.filterQuery && input.filterType === "user_name" ? await prisma.$queryRaw<(users & { contractor_name: string })[]>`
        SELECT u.*, c.contractor_name from users u 
        LEFT JOIN contractor c 
        ON u.contractor_id = c.id
        WHERE u.user_name LIKE ${"%" + input.filterQuery + "%"}` :

      input.filterQuery && input.filterType === "user_email" ? await prisma.$queryRaw<(users & { contractor_name: string })[]>`
        SELECT u.*, c.contractor_name from users u
        LEFT JOIN contractor c
        ON u.contractor_id = c.id
        WHERE u.user_email LIKE ${"%" + input.filterQuery + "%"}` :

      input.filterQuery && input.filterType === "user_role" ? await prisma.$queryRaw<(users & { contractor_name: string })[]>`
        SELECT u.*, c.contractor_name from users u
        LEFT JOIN contractor c
        ON u.contractor_id = c.id
        WHERE u.user_role LIKE ${"%" + input.filterQuery + "%"}` :

      input.filterQuery && input.filterType === "contractor_name" ? await prisma.$queryRaw<(users & { contractor_name: string })[]>`
        SELECT u.*, c.contractor_name from users u
        LEFT JOIN contractor c
        ON u.contractor_id = c.id
        WHERE c.contractor_name LIKE ${"%" + input.filterQuery + "%"}` :

      await prisma.$queryRaw<(users & { contractor_name: string })[]>`
        SELECT u.*, c.contractor_name from users u
        LEFT JOIN contractor c
        ON u.contractor_id = c.id`
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        user_name: z.string(),
        user_role: z.enum(["Admin", "IPT_Member", "Contractor"]),
        user_email: z.string(),
        contractor_id: z.number().optional()
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.users.update({
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
      return await getIPTMembers(input.project_id);
    }),
  addToUserProjectLink: protectedProcedure
    .input(
      z.object({
        project_id: z.number(),
        user_id: z.number(),
        mil_job_title_id: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx}) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      // Get the added user
      const addedUser = await prisma.users.findUnique({
        where: { id: input.user_id }
      });
      const project = await prisma.project.findUnique({
        where: { id: input.project_id }
      });
      if (addedUser?.user_email && project)
        await sendEmail(addedUser.user_email, `METIS - You have been added to ${project.project_name || "N/A"} by ${user.user_name || "N/A"} (${user.user_email || "N/A"})`,  `${user.user_name || "N/A"} (${user.user_email || "N/A"}) added you as an IPT member to the following project in METIS: \n\n\tProject name: ${project.project_name || "N/A"} \n\n\nLog into the METIS dashboard to view more detials.`)

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
    ...user_preferences_ext
});
