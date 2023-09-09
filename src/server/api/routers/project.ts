import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { ipt_members } from "~/types/ipt_members";
import type { view_project } from "~/types/view_project";
import { api } from "~/utils/api";
import { sendEmail } from "~/utils/email";
import { getIPTMembers } from "~/utils/iptMembers";

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

      // // Get all admin users
      // const admins = await prisma.users.findMany({
      //   where: { user_role: "Admin" },
      // });
      
      // // Send email to all admins
      // for (const admin of admins) {
      //   if(!admin.user_email)
      //     continue;
        
      //   await sendEmail(admin.user_email, `METIS - ${input.project_name} has been created by ${user.user_name} (${user.user_email})`,  `${user.user_name} (${user.user_email}) created the following project in METIS: \n\n\tProject name: ${input.project_name} \n\tProject type: ${input.project_type} \n\tContractor: ${input.contractor_id} \n\tBranch: ${input.branch_id} \n\tRequirement type: ${input.requirement_type_id} \n\tSummary: ${input.summary} \n\tCCAR number: ${input.ccar_num} \n\n\nLog into the METIS dashboard to view more detials.`)
      // }

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
        contract_num: z.string().optional(),
        contract_award_id: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      const old_contract_award = input.contract_award_id ? await prisma.contract_award.findUnique({
        where: { id: input.contract_award_id },
        select: { contract_num: true },
      }) : null;
      const old_project = await prisma.project.findUnique({
        where: { id: input.id },
      });
      const updated_project = await prisma.project.update({
        where: { id: input.id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { ...input, contract_num: undefined, contract_award_id: undefined } as any,
      });

      // Get all IPT Members for this project
      const iptMembers = await getIPTMembers(updated_project.id);

      // Get all IPT Members as users
      const iptMembersUsers = await prisma.users.findMany({
        where: { id: { in: iptMembers.map((iptMember) => iptMember.id) } },
      });

      // Send email to all IPT Members for this project
      let emailContent = '';

      if (old_project && old_project.project_name !== updated_project.project_name)
        emailContent += `Project Name: ${old_project.project_name || "N/A"} ---> ${updated_project.project_name || "N/A"} \n`;

      if (old_project && old_contract_award !== undefined && old_contract_award !== null && old_contract_award.contract_num !== input.contract_num) {
        emailContent += `Contract Number: ${old_contract_award.contract_num || "N/A"} ---> ${input.contract_num || "N/A"} \n`;
      }

      if (old_project && old_project.ccar_num !== updated_project.ccar_num)
        emailContent += `CCAR Number: ${old_project.ccar_num || "N/A"} ---> ${updated_project.ccar_num || "N/A"} \n`;

      if (old_project && old_project.contractor_id !== updated_project.contractor_id) {
        const oldContractor = await prisma.contractor.findUnique({
          where: { id: old_project.contractor_id || undefined },
          select: { contractor_name: true },
        });
        const oldContractorName = oldContractor ? oldContractor.contractor_name : "None";
      
        const newContractor = await prisma.contractor.findUnique({
          where: { id: updated_project.contractor_id || undefined },
          select: { contractor_name: true },
        });
        const newContractorName = newContractor ? newContractor.contractor_name : "None";
        
        emailContent += `Contractor: ${oldContractorName|| "N/A"} ---> ${newContractorName|| "N/A"} \n`;
      }

      if (old_project && old_project.branch_id !== updated_project.branch_id) {
        const oldBranch = await prisma.branches.findUnique({
          where: { id: old_project.branch_id || undefined },
          select: { branch_name: true },
        });
        const oldBranchName = oldBranch ? oldBranch.branch_name : "None";

        const newBranch = await prisma.branches.findUnique({
          where: { id: updated_project.branch_id || undefined },
          select: { branch_name: true },
        });
        const newBranchName = newBranch ? newBranch.branch_name : "None";

        emailContent += `Organization/Branch: ${oldBranchName} ---> ${newBranchName} \n`;
      }

      if (old_project && old_project.requirement_type_id !== updated_project.requirement_type_id) {
        const oldReqType = await prisma.requirement_types.findUnique({
          where: { id: old_project.requirement_type_id || undefined },
          select: { requirement_type: true },
        });
        const oldReqTypeName = oldReqType ? oldReqType.requirement_type : "None";

        const newReqType = await prisma.requirement_types.findUnique({
          where: { id: updated_project.requirement_type_id || undefined },
          select: { requirement_type: true },
        });
        const newReqTypeName = newReqType ? newReqType.requirement_type : "None";

        emailContent += `Requirement Type: ${oldReqTypeName || "N/A"} ---> ${newReqTypeName || "N/A"} \n`;
      }

      if (old_project && old_project.summary !== updated_project.summary)
        emailContent += `Capability Summary: ${old_project.summary || "N/A"} ---> ${updated_project.summary || "N/A"} \n`;

      if (emailContent) {
        for (const iptMember of iptMembersUsers) {
          if (!iptMember.user_email)
            continue;

          await sendEmail(iptMember.user_email, `METIS - ${input.project_name || "N/A"} has been updated by ${user.user_name || "N/A"} (${user.user_email || "N/A"})`, `${user.user_name || "N/A"} (${user.user_email || "N/A"}) updated the following project in METIS: \n\n${emailContent}\n\n\nLog into the METIS dashboard to view more details.`);
        }
      }
      // for (const iptMember of iptMembersUsers) {
      //   if (!iptMember.user_email)
      //     continue;

      //   let emailContent = '';
      //   for (const property in input) if (old_project && (old_project as {[key: string]: any})[property] !== (updated_project as {[key: string]: any})[property]) emailContent += `\t${property.charAt(0).toUpperCase() + property.slice(1)}: ${(old_project as {[key: string]: any})[property]} ---> ${(updated_project as {[key: string]: any})[property]} \n`;
      //   if (emailContent) await sendEmail(iptMember.user_email, `METIS - ${input.project_name} has been updated by ${user.user_name} (${user.user_email})`, `${user.user_name} (${user.user_email}) updated the following project in METIS: \n\n${emailContent}\n\n\nLog into the METIS dashboard to view more details.`);
      // }
      
      return updated_project;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx}) => {
      const user = ctx.session.db_user;
      if (!user) return null;

      // Get all IPT Members for this project
      const iptMembers = await getIPTMembers(input.id);

      // Get all IPT Members as users
      const iptMembersUsers = await prisma.users.findMany({
        where: { id: { in: iptMembers.map((iptMember) => iptMember.id) } },
      });

      // Send email to all IPT Members for this project
      for (const iptMember of iptMembersUsers) {
        if(!iptMember.user_email)
          continue;

        await sendEmail(iptMember.user_email, `METIS - ${input.id || "N/A"} has been deleted by ${user.user_name || "N/A"} (${user.user_email || "N/A"})`,  `${user.user_name || "N/A"} (${user.user_email || "N/A"}) deleted the following project in METIS: \n\n ${input.id || "N/A"} `)
      }
      
      const deleted_project = await prisma.project.delete({ where: { id: input.id } });
      return deleted_project;
    }),
  search: protectedProcedure.input(z.object({
    filterQuery: z.string().optional(),
    filterType: z.enum(["project_name", "contract_number", "contract_value", "contract_status", "dependency_status", "financial_status", "schedule_status", "branch", "contractor"])
  })
  ).query(async ({ ctx, input }) => {
    const user = ctx.session.db_user;
    if (!user) return null;
    
    if (user.user_role === "Admin" || user.user_role === "IPT_Member") {
      return input.filterQuery && input.filterType === "project_name" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE project_name LIKE ${"%" + input.filterQuery + "%"}` :

                  input.filterQuery && input.filterType === "contract_number" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_num LIKE ${"%" + input.filterQuery + "%"}` :

                  input.filterQuery && input.filterType === "contract_value" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_value LIKE ${"%" + input.filterQuery + "%"}` :

                  input.filterQuery && input.filterType === "contractor" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contractor_name LIKE ${"%" + input.filterQuery + "%"}` :

                  input.filterQuery && input.filterType === "contract_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_status = ${input.filterQuery}` :

                  input.filterQuery && input.filterType === "dependency_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE dependency_status = ${input.filterQuery}` :

                  input.filterQuery && input.filterType === "financial_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE financial_status = ${input.filterQuery}` :

                  input.filterQuery && input.filterType === "schedule_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE schedule_status = ${input.filterQuery}` :

                  input.filterQuery && input.filterType === "branch" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE branch = ${input.filterQuery}` :

                await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project`
    }
    // Restricted search for contractors
    else {
      const current_id = Number(user.contractor_id);
      return input.filterQuery && input.filterType === "project_name" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE project_name LIKE ${"%" + input.filterQuery + "%"} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "contract_number" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_num LIKE ${"%" + input.filterQuery + "%"} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "contract_value" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_value LIKE ${"%" + input.filterQuery + "%"} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "contractor" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contractor_name LIKE ${"%" + input.filterQuery + "%"} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "contract_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE contract_status = ${input.filterQuery} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "dependency_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE dependency_status = ${input.filterQuery} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "financial_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE financial_status = ${input.filterQuery} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "schedule_status" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE schedule_status = ${input.filterQuery} AND contractor_id = ${current_id}` :

                  input.filterQuery && input.filterType === "branch" ? await prisma.$queryRaw<view_project[]>
                  `SELECT * FROM view_project
                  WHERE branch = ${input.filterQuery} AND contractor_id = ${current_id}` :

                await prisma.$queryRaw<view_project[]>`SELECT * FROM view_project WHERE contractor_id = ${current_id}`
    }
  }),
});
