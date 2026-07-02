import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripApi } from "@modules/trip/api/tripApi";
import {
  DropActionPayload,
  StartTripPayload,
  StopActionPayload,
  TripListParams,
} from "@modules/trip/types";

export const useTrips = (params?: TripListParams) =>
  useQuery({
    queryKey: ["trips", params],
    queryFn: () => tripApi.list(params),
  });

export const useTrip = (id?: string) =>
  useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripApi.get(id as string),
    enabled: !!id,
  });

export const useRoutes = () =>
  useQuery({
    queryKey: ["routes"],
    queryFn: () => tripApi.listRoutes(),
  });

export const useStudents = (params?: { routeId?: string; status?: string }) =>
  useQuery({
    queryKey: ["students", params],
    queryFn: () => tripApi.listStudents(params),
  });

export const useStartTrip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartTripPayload) => tripApi.start(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
};

/** Invalidates both the trips list and the specific trip after a stop action. */
function useTripActionInvalidation() {
  const qc = useQueryClient();
  return (tripId: string) => {
    qc.invalidateQueries({ queryKey: ["trips"] });
    qc.invalidateQueries({ queryKey: ["trip", tripId] });
  };
}

export const useArriveStop = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: (payload: StopActionPayload) => tripApi.arrive(tripId, payload),
    onSuccess: () => invalidate(tripId),
  });
};

export const usePickupStop = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: (payload: StopActionPayload) => tripApi.pickup(tripId, payload),
    onSuccess: () => invalidate(tripId),
  });
};

export const useNoShowStop = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: (payload: StopActionPayload) => tripApi.noShow(tripId, payload),
    onSuccess: () => invalidate(tripId),
  });
};

export const useDropStop = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: (payload: DropActionPayload) => tripApi.drop(tripId, payload),
    onSuccess: () => invalidate(tripId),
  });
};

export const useReachSchool = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: () => tripApi.reachSchool(tripId),
    onSuccess: () => invalidate(tripId),
  });
};

export const useCompleteTrip = (tripId: string) => {
  const invalidate = useTripActionInvalidation();
  return useMutation({
    mutationFn: () => tripApi.complete(tripId),
    onSuccess: () => invalidate(tripId),
  });
};
