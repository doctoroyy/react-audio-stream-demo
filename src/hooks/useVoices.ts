import { useQuery } from "@tanstack/react-query";
import { fetchVoices } from "../queries";

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: () => fetchVoices(),
    staleTime: Infinity,
  });
}