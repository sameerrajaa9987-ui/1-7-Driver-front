import { useQuery } from "@tanstack/react-query";
import { earningsApi } from "@modules/earnings/api/earningsApi";

export const useEarnings = () =>
  useQuery({
    queryKey: ["earnings"],
    queryFn: () => earningsApi.list(),
  });

export const useMyEarnings = () =>
  useQuery({
    queryKey: ["earnings", "me"],
    queryFn: () => earningsApi.me(),
    retry: false,
  });
