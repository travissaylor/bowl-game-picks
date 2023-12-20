import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createPickSchema, picks } from "~/server/db/schema";

export const pickRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.picks.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.picks.findFirst({
        where: (picks) => eq(picks.id, input.id),
      });
    }),
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.picks.findMany({
        where: (picks) => eq(picks.userId, input.userId),
      });
    }),
  create: protectedProcedure
    .input(createPickSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(picks).values(input);
    }),
  batchCreate: protectedProcedure
    .input(z.array(createPickSchema))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(picks)
        .values(input)
        .onDuplicateKeyUpdate({
          set: {
            pick: sql`values(pick)`,
          },
        });
    }),
});
