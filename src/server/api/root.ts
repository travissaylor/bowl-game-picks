import { createTRPCRouter } from "~/server/api/trpc";
import { gameRouter } from "./routers/game";
import { pickRouter } from "./routers/pick";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  pick: pickRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
