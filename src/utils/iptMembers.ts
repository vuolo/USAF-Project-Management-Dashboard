import { prisma } from "~/server/db";
import { ipt_members } from "~/types/ipt_members";

export async function getIPTMembers(project_id: number) {
    return await prisma.$queryRaw<ipt_members[]>`
          SELECT 
            u.id, 
            mjt.mil_job_title, 
            u.user_name 
          FROM users u 
          INNER JOIN user_project_link upl on upl.user_id = u.id
          INNER JOIN military_job_titles mjt on upl.mil_job_title_id = mjt.id
          WHERE upl.project_id = ${project_id} AND upl.mil_job_title_id IS NOT NULL
          ORDER BY upl.mil_job_title_id`;
  }