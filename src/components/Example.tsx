import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetcher } from "../utils/fetcher";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Pagination } from "@mui/material";

function Example() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const apiUrl = import.meta.env.VITE_API;
  console.log(apiUrl);

  const { status, data, error, isPlaceholderData } = useQuery({
    queryKey: ["movies", page],
    queryFn: () => fetcher(page),
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  const pageCount = data && Math.ceil(data.totalResults / 10);
  console.log(pageCount);

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ["movies", page + 1],
        queryFn: () => fetcher(page + 1),
      });
    }
  }, [data, isPlaceholderData, page, queryClient]);

  const handleChange = (_,value:number)=>{
    setPage(value)
  }

  return (
    <div>
      <p>
        In this example, each page of data remains visible as the next page is
        fetched. The buttons and capability to proceed to the next page are also
        supressed until the next page cursor is known. Each page is cached as a
        normal query too, so when going to previous pages, you'll see them
        instantaneously while they are also refetched invisibly in the
        background.
      </p>
      {status === "pending" ? (
        <div>Loading...</div>
      ) : status === "error" ? (
        <div>Error: {error.message} </div>
      ) : (
        <div>
          {data.Search.map((movie:{imdbID:string,Title:string}) => (
            <p key={movie.imdbID}> {movie.Title} </p>
          ))}
        </div>
      )}
      <Pagination
        // onClick={() => setPage((page) => page + 1)}
        count={pageCount}
        variant="outlined"
        shape="rounded"
        onChange={handleChange}
      />
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}

export default Example;
