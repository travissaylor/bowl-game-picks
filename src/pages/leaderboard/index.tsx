import { useSession } from "next-auth/react";
import Head from "next/head";
import { useMemo } from "react";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { api } from "~/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/utils/ui";
import Link from "next/link";

export default function Leaderboard() {
  const { status } = useSession();
  const { data: userPicksData } = api.pick.getAllGroupedByUserId.useQuery();

  const sortedUsersByRecord = useMemo(() => {
    if (!userPicksData) return [];

    const usersByRecord = userPicksData.map((user) => {
      const record = {
        wins: 0,
        losses: 0,
      };

      user.picks.forEach((pick) => {
        if (
          pick.game.status !== "final" ||
          pick.game.awayScore === null ||
          pick.game.homeScore === null
        )
          return;

        if (
          (pick.pick === "away" && pick.game.awayScore > pick.game.homeScore) ||
          (pick.pick === "home" && pick.game.homeScore > pick.game.awayScore)
        ) {
          record.wins++;
          return;
        }

        record.losses++;
      });

      return {
        ...user,
        record,
      };
    });

    return usersByRecord.sort((a, b) => {
      if (a.record.wins > b.record.wins) return -1;
      if (a.record.wins < b.record.wins) return 1;

      if (a.record.losses < b.record.losses) return -1;
      if (a.record.losses > b.record.losses) return 1;

      return 0;
    });
  }, [userPicksData]);

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  return (
    <>
      <Head>
        <title>Leaderboard</title>
        <meta
          name="description"
          content="Stats and standings for the current bowl season"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col justify-center">
        <PageHeader
          title="Who's Winning?"
          description="Stats and standings for the current bowl season"
        />
      </main>

      <div className="m-auto flex flex-col items-center justify-center p-4">
        {sortedUsersByRecord.map((user, index) => {
          return (
            <Link href={`/leaderboard/${user.id}`} key={user.id}>
              <Card key={user.id} className={cn("my-3 w-[350px]")}>
                <CardHeader className="m-auto flex flex-col items-center justify-center">
                  <CardTitle>
                    {index + 1}. {user.name}
                  </CardTitle>
                  <CardDescription>
                    Picks Made: {user.picks.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="m-auto flex flex-col items-center justify-center">
                  <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {user.record.wins} - {user.record.losses}
                  </h1>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
