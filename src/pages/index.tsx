import { useSession } from "next-auth/react";
import Head from "next/head";
import { useMemo } from "react";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { api } from "~/utils/api";
import { cn, formatDate, isNullOrUndefined } from "~/utils/ui";

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

  const record = useMemo(() => {
    const record = {
      wins: 0,
      losses: 0,
    };

    if (!gamesQuery.data || !picksQuery.data) return record;

    gamesQuery.data.forEach((game) => {
      const pick = picksQuery.data?.find((pick) => pick.gameId === game.id);

      if (!pick) return;

      if (
        game.status !== "final" ||
        isNullOrUndefined(game.awayScore) ||
        isNullOrUndefined(game.homeScore)
      )
        return;

      if (
        (pick.pick === "away" && game.awayScore > game.homeScore) ||
        (pick.pick === "home" && game.homeScore > game.awayScore)
      ) {
        record.wins++;
        return;
      }

      record.losses++;
    });

    return record;
  }, [gamesQuery.data, picksQuery.data]);

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
    if (!pick) return "bg-gray-100 dark:bg-gray-800";

    if (game.status === "in_progress") {
      return "bg-yellow-100 dark:bg-yellow-800";
    }

    if (
      !isNullOrUndefined(game.awayScore) &&
      !isNullOrUndefined(game.homeScore)
    ) {
      if (pick.pick === "away" && game.awayScore > game.homeScore) {
        return "bg-green-100 dark:bg-green-800";
      }

      if (pick.pick === "home" && game.homeScore > game.awayScore) {
        return "bg-green-100 dark:bg-green-800";
      }

      return "bg-red-100 dark:bg-red-800";
    }

    return "bg-gray-100 dark:bg-gray-800";
  };

  return (
    <>
      <Head>
        <title>Bowl Game Pick Results</title>
        <meta
          name="description"
          content="See the updated scores for the bowl games and your picks."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <PageHeader
          title="Bowl Game Pick Results"
          description="See the updated scores for the bowl games and your picks."
        />
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Record: {record.wins} - {record.losses}
          </h3>
        </div>
        <div className="m-auto flex flex-col items-center justify-center p-4">
          {gamesQuery.data.map((game) => {
            const pick = picksQuery.data?.find(
              (pick) => pick.gameId === game.id,
            );

            return (
              <Card
                key={game.id}
                className={cn(cardColor(game, pick), "my-3 w-[400px]")}
              >
                <CardHeader className="m-auto flex flex-col items-center justify-center">
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>
                    {formatDate(game.date, "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="m-auto flex flex-col items-center justify-center">
                  <p className="text-md py-1 font-medium leading-none">
                    {game.awayTeam} vs. {game.homeTeam}
                  </p>
                  {game.status === "final" &&
                  game.awayScore &&
                  game.homeScore ? (
                    <p className="text-md py-1 font-medium leading-none">
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
                  {pick ? (
                    <p className="text-md py-1 font-medium leading-none">
                      Your Pick: {game[`${pick.pick}Team`]}
                    </p>
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
