import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import type { view_project } from "~/types/view_project";
import { sendEmail } from "~/utils/email";

export const projectRouter = createTRPCRouter({
  list_view: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    
    return user.user_role === "Admin" || user.user_role === "IPT_Member"
      ? await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`
      // Contractors
      : await prisma.$queryRaw<view_project[]>`
          SELECT * 
          FROM view_project vp
          WHERE vp.contractor_id = ${user.contractor_id}
          ORDER BY vp.id ASC`;
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
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.db_user;
      if (!user) return null;
      const new_project = await prisma.project.create({ data: { ...input } });
      if(!user.user_email)
      return new_project;
      await sendEmail(user.user_email, `METIS - ${input.project_name} has been created`,  `You created the following project in METIS: \n\nProject name: ${input.project_name} \nProject type: ${input.project_type} \nContractor: ${input.contractor_id} \nBranch: ${input.branch_id} \nRequirement type: ${input.requirement_type_id} \nSummary: ${input.summary} \nCCAR number: ${input.ccar_num} \n\n\nView more details on the METIS dashboard.`)
      return new_project;
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
    .mutation(async ({ input, ctx}) => {
      const user = ctx.session.db_user;
      if (!user) return null;
      const del_project = await prisma.project.delete({ where: { id: input.id } });
      if(!user.user_email)
      return del_project;
      await sendEmail(user.user_email, `${input.id} has been deleted`, 'This project has been deleted')
      return del_project;
    }),
});
