import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";

type Todos = {
  items: ReadonlyArray<{
    id: string;
    text: string;
  }>;
  ts: number;
};

type Inputs = {
  todo: string;
};

async function fetchTodos(): Promise<Todos> {
  const response = await axios.get(`http://localhost:5000/api/data`);
  console.log(response.data);
  return await response.data;
}

function useTodos() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodos });
}

function Example() {
  const queryClient = useQueryClient();
  const todoQuery = useTodos();

  const { register, handleSubmit,setValue } = useForm<Inputs>();

  const addTodoMutation = useMutation({
    mutationFn: async (newTodo: string) => {
      console.log("todo👀", newTodo);
      const response = await axios.post(
        `http://localhost:5000/api/data`,
        { todo: newTodo },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.status);
      if (response.status !== 201) {
        throw new Error("Something went wrong");
      }
      return await response.data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const formSubmit: SubmitHandler<Inputs> = (data) => {
    console.log("data", data);
    addTodoMutation.mutate(data.todo);
    setValue("todo", "");
  };

  return (
    <div>
      <p>
        In this example, new items can be created using a mutation. The new item
        will be optimistically added to the list in hopes that the server
        accepts the item. If it does, the list is refetched with the true items
        from the list. Every now and then, the mutation may fail though. When
        that happens, the previous list of items is restored and the list is
        again refetched from the server.
      </p>
      <form onSubmit={handleSubmit(formSubmit)}>
        <input {...register("todo")} type="text" />
        <button disabled={addTodoMutation.isPending}>Create</button>
      </form>
      <br />
      {todoQuery.isSuccess && (
        <>
          <div>
            Updated At: {new Date(todoQuery.data.ts).toLocaleTimeString()}{" "}
          </div>
          <ul>
            {todoQuery.data?.items.map((todo) => (
              <li key={todo.id}>{todo.text}</li>
            ))}
            {addTodoMutation.isPending && (
              <li style={{ opacity: 0.5 }}>{addTodoMutation.variables} </li>
            )}
            {addTodoMutation.isError && (
              <li style={{ color: "red" }}>
                {addTodoMutation.variables}
                <button
                  onClick={() =>
                    addTodoMutation.mutate(addTodoMutation.variables)
                  }
                >
                  Retry
                </button>
              </li>
            )}
          </ul>
          {todoQuery.isFetching && <div>Updating in background...</div>}
        </>
      )}
    </div>
  );
}

export default Example;
