import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createGameSchema, games, updateGameSchema } from "~/server/db/schema";

export const gameRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.games.findMany();
  }),
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.games.findFirst({
        where: (game) => eq(game.id, input.id),
      });
    }),
  create: protectedProcedure
    .input(createGameSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(games).values(input);
    }),
  update: protectedProcedure
    .input(updateGameSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      await ctx.db.update(games).set(rest).where(eq(games.id, id));
    }),
});
