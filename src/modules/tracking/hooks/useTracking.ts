import { useMutation, useQuery } from "@tanstack/react-query";
import { trackingApi, IngestPayload } from "@modules/tracking/api/trackingApi";

/** Latest position for a trip (polling fallback; socket is the live channel). */
export const useTripPosition = (tripId?: string) =>
  useQuery({
    queryKey: ["tracking", tripId],
    queryFn: () => trackingApi.getForTrip(tripId as string),
    enabled: !!tripId,
  });

export const useIngestPosition = () =>
  useMutation({
    mutationFn: (payload: IngestPayload) => trackingApi.ingest(payload),
  });
