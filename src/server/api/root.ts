import { createTRPCRouter } from "~/server/api/trpc";
import { projectRouter } from "~/server/api/routers/project";
import { userRouter } from "./routers/user";
import { obligationRouter } from "./routers/obligation";
import { expenditureRouter } from "./routers/expenditure";
import { financialSummaryRouter } from "./routers/financial_summary";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  obligation: obligationRouter,
  expenditure: expenditureRouter,
  financial_summary: financialSummaryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
