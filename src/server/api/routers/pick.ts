import { eq, inArray, sql } from "drizzle-orm";
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
  getAllGroupedByUserId: publicProcedure.query( async ({ ctx }) => {
    const allUsers = await ctx.db.query.users.findMany({
      with: {
        picks: {
          with: {
            game: true,
          }
        },
      }
    });

    return allUsers;
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
  dedupeUserPicks: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const allPicks = await ctx.db.query.picks.findMany({
        where: (picks) => eq(picks.userId, input.userId),
      });
      
      const dupes = allPicks.filter((pick, index) => {
        return allPicks.findIndex((p) => p.gameId === pick.gameId) !== index;
      });

      const dupeIds = dupes.map((p) => p.id);
      
      await ctx.db.delete(picks).where(inArray(picks.id, dupeIds));
    }),
});
