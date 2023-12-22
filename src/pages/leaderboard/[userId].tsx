import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
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

export default function UserPicks() {
  const router = useRouter();
  const userId = useMemo(() => {
    const userIdQueryParam = router.query.userId;
    if (typeof userIdQueryParam !== "string") {
      return undefined;
    }
    return userIdQueryParam;
  }, [router.query]);

  const { status, data: sessionData } = useSession();
  const gamesQuery = api.game.getAll.useQuery();
  const picksQuery = api.pick.getByUserId.useQuery(
    {
      userId: userId ?? "",
    },
    {
      enabled: !!userId,
    },
  );

  const userQuery = api.user.getById.useQuery(
    {
      id: userId ?? "",
    },
    {
      enabled: !!userId,
    },
  );

  const gamesData = useMemo(() => {
    if (!gamesQuery.data) return [];

    return gamesQuery.data.map((game) => {
      const pick = picksQuery.data?.find((pick) => pick.gameId === game.id);

      return {
        ...game,
        pick,
      };
    });
  }, [gamesQuery.data, picksQuery.data]);

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

  if (gamesQuery.isLoading || picksQuery.isLoading)
    return <div>Loading...</div>;
  if (gamesQuery.isError || picksQuery.isError) return <div>Error</div>;

  const cardColor = (
    game: (typeof gamesData)[number],
    pick: (typeof gamesData)[number]["pick"],
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

  const pickResult = (
    game: (typeof gamesData)[number],
    pick: (typeof gamesData)[number]["pick"],
  ) => {
    if (!pick) return "No Pick";

    if (game.status === "in_progress") {
      return "In Progress";
    }

    if (game.status === "scheduled") {
      return "Scheduled";
    }

    if (
      !isNullOrUndefined(game.awayScore) &&
      !isNullOrUndefined(game.homeScore)
    ) {
      if (pick.pick === "away" && game.awayScore > game.homeScore) {
        return "Win";
      }

      if (pick.pick === "home" && game.homeScore > game.awayScore) {
        return "Win";
      }

      return "Loss";
    }

    return "No Pick";
  };

  return (
    <>
      <Head>
        <title>{userQuery.data?.name ?? "User"}'s Picks</title>
        <meta name="description" content="College Football Picks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <PageHeader
          title={`${userQuery.data?.name ?? "User"}'s Picks`}
          description="Pick breakdown"
        />
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Record: {record.wins} - {record.losses}
          </h3>
        </div>
        <div className="m-auto flex flex-col items-center justify-center p-4">
          {gamesData.map((game) => {
            return (
              <Card
                key={game.id}
                className={cn(cardColor(game, game.pick), "my-3 w-[350px]")}
              >
                <CardHeader className="m-auto flex flex-col items-center justify-center">
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>
                    {pickResult(game, game.pick)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="m-auto flex flex-col items-center justify-center">
                  <p className="text-md py-1 font-medium leading-none">
                    {game.awayTeam} vs. {game.homeTeam}
                  </p>
                  {game.status === "final" &&
                  !isNullOrUndefined(game.awayScore) &&
                  !isNullOrUndefined(game.homeScore) ? (
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
                  {game.pick ? (
                    <p className="my-4 py-1 text-lg font-medium leading-none">
                      {game[`${game.pick.pick}Team`]}
                    </p>
                  ) : (
                    <p className="my-4 py-1 text-lg font-medium leading-none">
                      {game.status === "scheduled" ? "Pick: TBD" : "No Pick"}
                    </p>
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
