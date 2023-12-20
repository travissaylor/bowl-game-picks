import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { api } from "~/utils/api";
import { cn, formatDate } from "~/utils/ui";

export default function Home() {
  const { status, data: sessionData } = useSession();
  const gamesQuery = api.game.getAll.useQuery();
  const picksQuery = api.pick.getByUserId.useQuery(
    {
      userId: sessionData?.user.id ?? "",
    },
    {
      enabled: !!sessionData?.user.id,
    },
  );

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  if (gamesQuery.isLoading) return <div>Loading...</div>;
  if (
    gamesQuery.isError ||
    picksQuery.isError ||
    !gamesQuery.data ||
    !picksQuery.data
  )
    return <div>Error</div>;

  const cardColor = (
    game: (typeof gamesQuery)["data"][number],
    pick: (typeof picksQuery)["data"][number] | undefined,
  ) => {
    if (!pick) return "bg-gray-100";

    if (game.status === "in_progress") {
      return "bg-yellow-100";
    }

    if (game.awayScore && game.homeScore) {
      if (pick.pick === "away" && game.awayScore > game.homeScore) {
        return "bg-green-100";
      }

      if (pick.pick === "home" && game.homeScore > game.awayScore) {
        return "bg-green-100";
      }

      return "bg-red-100";
    }

    return "bg-gray-100";
  };

  return (
    <>
      <Head>
        <title>Bowl Game Pick Results</title>
        <meta name="description" content="See the updated scores for the bowl games and your picks." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <PageHeader
          title="Bowl Game Pick Results"
          description="See the updated scores for the bowl games and your picks."
        />
        <div className="m-auto flex flex-col items-center justify-center p-4">
          {gamesQuery.data.map((game) => {
            const pick = picksQuery.data?.find(
              (pick) => pick.gameId === game.id,
            );

            return (
              <Card key={game.id} className={cn(cardColor(game, pick), "my-3 w-[400px]")}>
                <CardHeader className="m-auto flex flex-col items-center justify-center">
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>
                    {formatDate(game.date, "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="m-auto flex flex-col items-center justify-center">
                  <p className="text-md font-medium leading-none py-1">
                    {game.awayTeam} vs. {game.homeTeam}
                  </p>
                  {game.status === "final" &&
                  game.awayScore &&
                  game.homeScore ? (
                    <p className="text-md font-medium leading-none py-1">
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
                  { pick ? (
                    <p className="text-md font-medium leading-none py-1">Your Pick: {game[`${pick.pick}Team`]}</p>
                  ) : (
                    <p>Pick: TBD</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
