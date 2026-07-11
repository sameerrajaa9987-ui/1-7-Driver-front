import { useMutation, useQuery } from "@tanstack/react-query";
import { trackingApi, IngestPayload } from "@modules/tracking/api/trackingApi";

/**
 * Latest known position for a trip. Socket.IO is the live push channel, but a
 * client that opens mid-trip won't get a frame until the next push — so we seed
 * from this GET on mount and keep polling as a fallback (e.g. flaky sockets).
 */
export const useTripPosition = (tripId?: string) =>
  useQuery({
    queryKey: ["tracking", tripId],
    queryFn: () => trackingApi.getForTrip(tripId as string),
    enabled: !!tripId,
    refetchInterval: tripId ? 8000 : false,
  });

export const useIngestPosition = () =>
  useMutation({
    mutationFn: (payload: IngestPayload) => trackingApi.ingest(payload),
  });
