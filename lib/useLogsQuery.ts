import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/lib/api";
import { transformLogs } from "@/lib/transform";

// Shared query config so multiple call sites reuse one cache entry (no extra
// fetch) instead of drilling props. refetchInterval varies per caller.
export function useLogsQuery(refetchInterval: number | false = false) {
  return useQuery({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    select: transformLogs,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval,
  });
}
