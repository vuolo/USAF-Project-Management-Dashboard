import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_project } from "~/types/view_project";

export const projectRouter = createTRPCRouter({
  list_view: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;

    return user.user_role === "Admin"
      ? await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`
      : await prisma.$queryRaw<view_project[]>`
          SELECT * 
          FROM user_project_link upl
          INNER JOIN view_project vp ON vp.id = upl.project_id
          WHERE upl.user_id = ${user.id}
          ORDER BY upl.project_id ASC`;
  }),
  get_view: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return (
        (
          await prisma.$queryRaw<view_project[]>`
            SELECT * FROM view_project WHERE id = ${input.id} LIMIT 1`
        )[0] || null
      );
    }),
  add: protectedProcedure
    .input(
      z.object({
        project_name: z.string(),
        project_type: z.enum(["Contract", "MIPR"]),
        contractor_id: z.number(),
        branch_id: z.number(),
        requirement_type_id: z.number(),
        summary: z.string(),
        ccar_num: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.project.create({ data: { ...input } });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        project_name: z.string(),
        project_type: z.enum(["Contract", "MIPR"]),
        contractor_id: z.number(),
        branch_id: z.number(),
        requirement_type_id: z.number(),
        summary: z.string(),
        ccar_num: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.project.update({
        where: { id: input.id },
        data: { ...input },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.project.delete({ where: { id: input.id } });
    }),
});
