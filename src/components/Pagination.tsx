import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Example from "./Example";

const queryClient = new QueryClient();

export default function Pagination() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}
