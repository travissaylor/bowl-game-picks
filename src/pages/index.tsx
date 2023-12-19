import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";

import { api } from "~/utils/api";
import { formatDate } from "~/utils/ui";

export default function Home() {
  const gamesQuery = api.game.getAll.useQuery();

  if (gamesQuery.isLoading) return <div>Loading...</div>;
  if (gamesQuery.isError || !gamesQuery.data) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>College Football Picks</title>
        <meta name="description" content="College Football Picks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <h1 className="text-center text-6xl font-bold text-white">
            College Football Picks
          </h1>
          <p className="text-center text-2xl text-white">
            Make your picks for bowl season
          </p>
        </div>
        {gamesQuery.data.map((game) => (
          <Card key={game.id} className="w-[350px]">
            <CardHeader>{game.name}</CardHeader>
            <CardDescription>{formatDate(game.date, "PPP")}</CardDescription>
            <CardContent>
              <p>
                {game.awayTeam} vs. {game.homeTeam}
              </p>
              {game.awayScore && game.homeScore ? (
                <p>
                  {game.awayScore} - {game.homeScore}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
