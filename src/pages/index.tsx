import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

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
      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          <h1 className="text-center text-6xl font-bold text-white">
            College Football Picks
          </h1>
          <p className="text-center text-2xl text-white">
            Make your picks for bowl season
          </p>
        </div>
        {gamesQuery.data.map((game) => (
          <div
            key={game.id}
            className="flex flex-col items-center justify-center gap-4"
          >
            <Link
              href={`/games/${game.id}`}
              className="text-center text-2xl text-white"
            >
              {game.awayTeam} @ {game.homeTeam}
            </Link>
            <p className="text-center text-2xl text-white">
              {game.awayScore} - {game.homeScore}
            </p>
          </div>
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
