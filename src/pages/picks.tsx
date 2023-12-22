import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormItem, FormMessage } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { createPickSchema, type CreatePickSchema } from "~/server/db/schema";
import { api } from "~/utils/api";
import { formatDate } from "~/utils/ui";

const formSchema = z.object({
  picks: z.array(
    z.object({
      pickId: createPickSchema.shape.id.optional(),
      gameId: createPickSchema.shape.gameId,
      pick: createPickSchema.shape.pick,
    }),
  ),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Picks() {
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
  const picksMutation = api.pick.batchCreate.useMutation();

  const picks = useMemo(() => {
    if (!gamesQuery.data) {
      return [];
    }
    return gamesQuery.data.map((game) => {
      const pick = picksQuery.data?.find((pick) => pick.gameId === game.id);
      if (!pick) {
        return {
          gameId: game.id,
        };
      }
      return {
        gameId: game.id,
        pick: pick.pick,
        pickId: pick.id,
      };
    });
  }, [gamesQuery.data, picksQuery.data]);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: {
      // @ts-expect-error Want to have non selected picks be undefined but can't use default values
      picks,
    },
  });
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;
  const { fields, update } = useFieldArray({
    control: control,
    name: "picks",
  });

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  if (gamesQuery.isLoading || picksQuery.isLoading)
    return <div>Loading...</div>;
  if (
    gamesQuery.isError ||
    picksQuery.isError ||
    !gamesQuery.data ||
    !picksQuery.data
  )
    return <div>Error</div>;

  const onSubmit = handleSubmit(async (data) => {
    if (!sessionData?.user.id) {
      console.error("No user id");
      return;
    }
    const submittedPicks = data.picks.map((field) => ({
      gameId: field.gameId,
      pick: field.pick,
      userId: sessionData?.user.id,
      id: field.pickId,
    }));
    await picksMutation.mutateAsync(submittedPicks);
  });

  return (
    <>
      <Head>
        <title>Pick 'Em</title>
        <meta name="description" content="College Football Picks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <PageHeader
          title="Pick 'Em"
          description="Make your picks for bowl season"
        />
        <div className="m-auto flex flex-col items-center justify-center p-4">
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="m-w-xl m-auto flex flex-col space-y-8"
            >
              {fields.map((field, index) => {
                const game = gamesQuery.data.find(
                  (game) => game.id === field.gameId,
                );
                if (!game) {
                  return <></>;
                }
                return (
                  <div key={index} className="my-3 w-[350px]">
                    <div className="m-auto flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center justify-center">
                        <h3 className="text-lg font-medium leading-none">
                          {game.name}
                        </h3>
                        <p className="text-muted-foreground py-2 text-sm">
                          {formatDate(game.date, "PPP")}
                        </p>
                        <FormItem className="flex items-center justify-center">
                          <Select
                            {...form.register(`picks.${index}.pick`)}
                            value={field.pick}
                            onValueChange={(value) =>
                              update(index, {
                                ...field,
                                pick: value as CreatePickSchema["pick"],
                              })
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Pick" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="away">
                                {game.awayTeam}
                              </SelectItem>
                              <SelectItem value="home">
                                {game.homeTeam}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button
                variant={isSubmitting ? "outline" : "default"}
                size={"default"}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
}
