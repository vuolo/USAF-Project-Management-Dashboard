import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const wbsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ project_id: z.number(), clin_num: z.number() }))
    .query(async ({ input }) => {
      return await prisma.task_resource_table.findMany({
        where: {
          project_id: input.project_id,
          clin_num: input.clin_num,
        },
      });
    }),
  createMany: protectedProcedure
    .input(
      z.array(
        z.object({
          project_id: z.number(),
          task_id: z.string(),
          task_description: z.string(),
          month: z.date().optional().nullable(),
          clin_num: z.number().optional().nullable(),
          wbs: z.string().optional().nullable(),
          source_type: z.string().optional().nullable(),
          resource_code: z.string().optional().nullable(),
          resource_description: z.string().optional().nullable(),
          resource_type: z.string().optional().nullable(),
          rate: z.number().optional().nullable(),
          hours_worked: z.number().optional().nullable(),
          units: z.number().optional().nullable(),
          cost: z.number().optional().nullable(),
          base_cost: z.number().optional().nullable(),
          direct_cost: z.number().optional().nullable(),
          total_price: z.number().optional().nullable(),
        })
      )
    )
    .mutation(async ({ input }) => {
      return await prisma.task_resource_table.createMany({
        data: input,
      });
    }),
    deleteMany: protectedProcedure  // Delete all clin data for a project
    .input(z.object({ project_id: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.task_resource_table.deleteMany({
        where: {
          project_id: input.project_id,
        },
      });
    }),
    deleteManyClin: protectedProcedure  // Delete specific clin data for a project
    .input(z.object({ project_id: z.number(), clin_num: z.number() }))
    .mutation(async ({ input }) => {
      return await prisma.task_resource_table.deleteMany({
        where: {
          project_id: input.project_id,
          clin_num: input.clin_num,
        },
      });
    }),
});

// model task_resource_table {
//   id                   Int        @id @default(autoincrement())
//   project_id           Int?
//   clin_id              Int?
//   task_id              String     @db.VarChar(20)
//   task_description     String     @db.VarChar(80)
//   month                DateTime?  @db.Date
//   wbs                  String?    @db.VarChar(20)
//   clin_num             Int?
//   source_type          String?    @db.VarChar(40)
//   resource_code        String?    @db.VarChar(20)
//   resource_description String?    @db.VarChar(40)
//   resource_type        String?    @db.VarChar(20)
//   rate                 Decimal?   @db.Decimal(13, 2)
//   hours_worked         Int?
//   units                Decimal?   @db.Decimal(13, 2)
//   cost                 Decimal?   @db.Decimal(13, 2)
//   base_cost            Decimal?   @db.Decimal(13, 2)
//   direct_cost          Decimal?   @db.Decimal(13, 2)
//   total_price          Decimal?   @db.Decimal(13, 2)
//   clin_data            clin_data? @relation(fields: [clin_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "task_resource_table_ibfk_3")
//   project              project?   @relation(fields: [project_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "task_resource_table_ibfk_4")

//   @@index([clin_id], map: "clin_id")
//   @@index([project_id], map: "project_id")
// }
