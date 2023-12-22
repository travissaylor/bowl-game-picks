import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";

import { useSession } from "next-auth/react";
import { db } from "~/server/db";
import {
  type UpdateGameSchema,
  games,
  updateGameSchema,
} from "~/server/db/schema";
import { api } from "~/utils/api";
import { eq } from "drizzle-orm";
import { Unauthenticated } from "~/components/orchestrated/unauthenticated";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn, formatDate } from "~/utils/ui";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/orchestrated/page-header";

export default function AdminEditGame({
  game,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { status } = useSession();

  const { mutateAsync } = api.game.update.useMutation();
  const form = useForm<UpdateGameSchema>({
    resolver: zodResolver(updateGameSchema),
    defaultValues: {
      ...game,
      date: new Date(game.date),
      awayScore: game.awayScore ?? undefined,
      homeScore: game.homeScore ?? undefined,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
  });

  if (status === "unauthenticated") {
    return <Unauthenticated />;
  }

  return (
    <div className="flex flex-col content-center justify-center pt-8">
      <PageHeader title="Admin" description="Add bowl games" />
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="m-w-xl m-auto flex flex-col space-y-8 mb-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="awayTeam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Away Team</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="homeTeam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Team</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="awayScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Away Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="homeScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Score</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant={isSubmitting ? "ghost" : "default"}
            disabled={isSubmitting}
            className={"w-[240px] pl-3 text-left font-normal"}
          >
            {isSubmitting ? "..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export const getStaticPaths = async () => {
  const allGames = await db.select().from(games);

  return {
    paths: allGames.map((game) => ({
      params: { id: game.id.toString() },
    })),
    fallback: false,
  };
};

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string }>,
) => {
  const { id } = context.params ?? {};
  const singleGame = await db
    .select()
    .from(games)
    .where((games) => eq(games.id, parseInt(id ?? "")));
  if (!singleGame[0]) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      game: { ...singleGame[0], date: singleGame[0].date.toISOString() },
    },
  };
};
