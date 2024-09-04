import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type Inputs = {
  interval: number;
  todo: string;
};

function Example() {
  const [intervalMs, setIntervalMs] = useState(1000);

  const {
    status,
    data: todos = [],
    error,
    isFetching,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async (): Promise<Array<string>> => {
      const response = await axios.get("http://localhost:5000/api/data");
      console.log(response);
      return response.data;
    },
    refetchInterval: intervalMs,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const submitFunction = (data: Inputs) => {
    addMutation.mutate(data.todo, {
      onSuccess: () => {
        alert("Data Submitted");
      },
    });
  };

  const queryClient = useQueryClient();

  /*
   ?  When you use the refetchInterval option with useQuery, it determines how often the query should automatically refetch data. Even if you call queryClient.invalidateQueries, the data will not be refetched immediately if the refetchInterval is still in effect.

   ? refetchInterval: This option sets an interval at which the query automatically refetches data. If you set refetchInterval to 1000 milliseconds (1 second), the query will automatically refetch every 1 second.

   ? invalidateQueries: This method marks the query as invalid, prompting React Query to refetch the data. However, if you have refetchInterval set, the query will not refetch immediately but will do so according to the refetchInterval timing.

  */

  const addMutation = useMutation({
    mutationFn: (add: string) =>
      axios.post("http://localhost:5000/api/data", { todo: add }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => axios.get("http://localhost:5000/api/data/clear"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  if (status === "pending") return <h1>Loading...</h1>;
  if (status === "error") return <span>Error: {error.message}</span>;

  return (
    <div>
      <h1>Auto Refetch with stale-time set to {intervalMs} ms </h1>
      <p>
        This example is best experienced on your own machine, where you can open
        multiple tabs to the same localhost server and see your changes
        propagate between the two.
      </p>
      <label>
        Query Interval speed (ms):
        <input
          type="number"
          step={100}
          value={intervalMs}
          {...register("interval", {
            required: true,
            onChange: (e) => {
              setIntervalMs(Number(e.target.value));
            },
          })}
        />
        {errors.interval && <span>Field is Required</span>}
        <span
          style={{
            display: "inline-block",
            marginLeft: ".5rem",
            width: 10,
            height: 10,
            background: isFetching ? "green" : "transparent",
            transition: !isFetching ? "all .3s ease" : "none",
            borderRadius: "100%",
            transform: "scale(2)",
          }}
        />
      </label>
      <h2>Todo List</h2>
      <form onSubmit={handleSubmit(submitFunction)}>
        <input
          type="text"
          {...register("todo")}
          placeholder="enter something"
        />
      </form>
      <ul>
        {todos.map((item) => (
          <li key={item}>{item} </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => {
            clearMutation.mutate();
          }}
        >
          Clear All
        </button>
      </div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}

export default Example;
