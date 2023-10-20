/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auditlog } from "@prisma/client";
import { z } from "zod";
import { json } from "node:stream/consumers";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const loggerMiddleware = t.middleware(
  async ({ ctx, path, type, next, input, rawInput }) => {
    const result = await next({
      ctx,
    });

    if (type == "mutation") {
      const inputdata = {
        user: ctx.session?.db_user?.user_email
          ? ctx.session.db_user.user_email
          : "N/A",
        endpoint: path,
        succeeded: result.ok ? true : false,
        time: new Date(),
        query: JSON.stringify(rawInput),
      };

      try {
        if (
          z
            .object({
              user: z.string(),
              endpoint: z.string(),
              succeeded: z.boolean(),
              time: z.date(),
              query: z.string(),
            })
            .parse(inputdata)
        ) {
          await prisma.auditlog.create({
            data: {
              user: inputdata.user,
              endpoint: inputdata.endpoint,
              succeeded: inputdata.succeeded,
              time: inputdata.time,
              query: inputdata.query,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    }

    return result;
  }
);

import { utcToZonedTime } from "date-fns-tz";

type Convertible =
  | Date
  | Convertible[]
  | { [key: string]: Convertible }
  | undefined;

// Recursive function to convert dates in nested objects and arrays
const convertDatesInObject = (obj: Convertible): Convertible => {
  if (obj instanceof Date) {
    const isDST = isDateInDST(obj, "America/New_York");
    // Add 4 hours for EDT or 5 hours for EST
    obj.setHours(obj.getHours() + (isDST ? 4 : 5));
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDatesInObject);
  }
  if (typeof obj === "object" && obj !== null) {
    const newObj: { [key: string]: Convertible } = {};
    for (const key in obj) {
      newObj[key] = convertDatesInObject(obj[key]);
    }
    return newObj;
  }
  return obj;
};

function isDateInDST(date: Date, timeZone: string): boolean {
  // A date in January, which is outside of DST
  const januaryDate = new Date(date.getFullYear(), 0, 1);
  const januaryOffset = -Math.round(januaryDate.getTimezoneOffset() / 60);

  // The timezone offset for the given date
  const dateInTimeZone = utcToZonedTime(date, timeZone);
  const dateOffset = -Math.round(dateInTimeZone.getTimezoneOffset() / 60);

  // DST is in effect if the offsets are different
  return januaryOffset !== dateOffset;
}

const convertTimezoneMiddleware = t.middleware(
  async ({ ctx, type, next, input }) => {
    const result = await next({
      ctx,
    });

    if (
      result.ok &&
      (typeof result.data === "object" || result.data === undefined) &&
      result.data !== null &&
      result.data !== undefined
    ) {
      result.data = convertDatesInObject(
        result.data as Convertible
      ) as typeof result.data;
    }

    return result;
  }
);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(loggerMiddleware)
  .use(convertTimezoneMiddleware);
