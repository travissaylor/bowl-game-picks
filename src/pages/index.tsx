import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { api } from "~/utils/api";
import { formatDate } from "~/utils/ui";

export default function Home() {
  const gamesQuery = api.game.getAll.useQuery();
  const { status, data: sessionData } = useSession();

  if (status === "unauthenticated") {
    return (
      <main className="flex flex-col justify-center">
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl py-2">
            Please Login First
          </h1>
          <p className="text-muted-foreground text-xl pb-2">
            You must be logged in to make picks
          </p>
          <Button
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </Button>
        </div>
      </main>
    );
  }

  if (gamesQuery.isLoading) return <div>Loading...</div>;
  if (gamesQuery.isError || !gamesQuery.data) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>College Football Picks</title>
        <meta name="description" content="College Football Picks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl py-2">
            College Football Picks
          </h1>
          <p className="text-muted-foreground text-xl">
            Make your picks for bowl season
          </p>
        </div>
        <div className="m-auto flex flex-col items-center justify-center p-4">
          {gamesQuery.data.map((game) => (
            <Card key={game.id} className="my-3 w-[400px]">
              <CardHeader className="m-auto flex flex-col items-center justify-center">
                <CardTitle>{game.name}</CardTitle>
                <CardDescription>
                  {formatDate(game.date, "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="m-auto flex flex-col items-center justify-center">
                <p className="text-sm font-medium leading-none">
                  {game.awayTeam} vs. {game.homeTeam}
                </p>
                {game.awayScore && game.homeScore ? (
                  <p>
                    <span
                      className={
                        game.awayScore > game.homeScore ? "font-semibold" : ""
                      }
                    >
                      {game.awayScore}
                    </span>{" "}
                    -{" "}
                    <span
                      className={
                        game.homeScore > game.awayScore ? "font-semibold" : ""
                      }
                    >
                      {game.homeScore}
                    </span>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}