import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { buttonVariants } from "~/components/ui/button";
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
  const { status } = useSession();
  const gamesQuery = api.game.getAll.useQuery();

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  if (gamesQuery.isLoading) return <div>Loading...</div>;
  if (gamesQuery.isError || !gamesQuery.data) return <div>Error</div>;

  return (
    <>
      <Head>
        <title>Bowl Games</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <PageHeader title="Bowl Games" description="Find Games to update" />
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <Link
            href="/admin/games/create"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            + Create New Game
          </Link>
          {gamesQuery.data.map((game) => {
            return (
              <Link href={`/admin/games/${game.id}`} key={game.id}>
                <Card key={game.id} className={"my-3 w-[400px]"}>
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
                            game.awayScore > game.homeScore
                              ? "font-semibold"
                              : ""
                          }
                        >
                          {game.awayScore}
                        </span>{" "}
                        -{" "}
                        <span
                          className={
                            game.homeScore > game.awayScore
                              ? "font-semibold"
                              : ""
                          }
                        >
                          {game.homeScore}
                        </span>
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
