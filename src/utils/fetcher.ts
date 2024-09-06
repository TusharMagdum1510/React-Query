import axios from "axios";

// const apiUrl = import.meta.env.VITE_API;

export const fetcher = async (
  page = 1
): Promise<{
  projects: Array<object>;
  hasMore: boolean;
}> => {
  const response = await axios.get(`http://www.omdbapi.com/?s=latest&page=${page}&apikey=b90b66dd`);
  console.log(response);
  return await response.data;
};
