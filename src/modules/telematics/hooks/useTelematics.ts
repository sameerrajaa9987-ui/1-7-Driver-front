import { useQuery } from "@tanstack/react-query";
import { telematicsApi } from "@modules/telematics/api/telematicsApi";

export const useDriverScores = () =>
  useQuery({
    queryKey: ["telematics-scores"],
    queryFn: () => telematicsApi.scores(),
  });

export const useTelematicsEvents = (driverId?: string) =>
  useQuery({
    queryKey: ["telematics-events", driverId ?? null],
    queryFn: () => telematicsApi.events(driverId ? { driverId } : undefined),
    enabled: !!driverId,
  });
