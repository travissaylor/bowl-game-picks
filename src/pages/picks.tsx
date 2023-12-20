import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "~/components/orchestrated/page-header";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  type BatchCreatePickSchema,
  batchCreatePickSchema,
  createPickSchema,
  CreatePickSchema,
} from "~/server/db/schema";
import { api } from "~/utils/api";

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
  const gamesQuery = api.game.getAll.useQuery();
  const picksQuery = api.pick.getAll.useQuery();
  const picksMutation = api.pick.batchCreate.useMutation();
  const { status, data: sessionData } = useSession();

  const picks = useMemo(() => {
    if (!gamesQuery.data) {
      return [];
    }
    return gamesQuery.data.map((game) => {
      const pick = picksQuery.data?.find((pick) => pick.gameId === game.id);
      if (!pick) {
        return {
          gameId: game.id,
          pick: "away" as const,
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
      picks,
    },
  });
  const { fields, update } = useFieldArray({
    control: form.control,
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

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    if (!sessionData?.user.id) {
      console.error("No user id");
      return;
    }
    const submittedPicks = fields.map((feild) => ({
      gameId: feild.gameId,
      pick: feild.pick,
      userId: sessionData?.user.id,
      id: feild.pickId,
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
                  <div key={index} className="my-3 w-[400px]">
                    <div className="m-auto flex flex-col items-center justify-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium leading-none">
                          {game.awayTeam} vs. {game.homeTeam}
                        </p>
                        <FormItem>
                          <FormLabel>Pick</FormLabel>
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
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
}
