import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { CreateGameSchema, createGameSchema } from "~/server/db/schema";
import { api } from "~/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Admin() {
  const { status } = useSession();
  const { mutateAsync, error } = api.game.create.useMutation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateGameSchema>({
    resolver: zodResolver(createGameSchema),
  });
  const onSubmit = handleSubmit(async (data) => {
    await mutateAsync(data);
  });
  if (status === "unauthenticated") {
    return <div>Access Denied</div>;
  }
  return (
    <div>
      <h1>Admin</h1>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <label htmlFor="name">Name</label>
        <input required {...register("name")} />
        <p>{errors.name?.message}</p>
        <label htmlFor="date">Date</label>
        <input required {...register("date")} />
        <p>{errors.date?.message}</p>
        <label htmlFor="awayTeam">Away Team</label>
        <input required {...register("awayTeam")} />
        <p>{errors.awayTeam?.message}</p>
        <label htmlFor="homeTeam">Home Team</label>
        <input required {...register("homeTeam")} />
        <p>{errors.homeTeam?.message}</p>
        <label htmlFor="awayScore">Away Score</label>
        <input
          type="number"
          {...register("awayScore", {
            setValueAs: (value) => Number(value),
          })}
        />
        <p>{errors.awayScore?.message}</p>
        <label htmlFor="homeScore">Home Score</label>
        <input
          type="number"
          {...register("homeScore", {
            setValueAs: (value) => Number(value),
          })}
        />
        <p>{errors.homeScore?.message}</p>
        <label htmlFor="status">Status</label>
        <select required {...register("status")}>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="final">Final</option>
        </select>
        <p>{errors.status?.message}</p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
