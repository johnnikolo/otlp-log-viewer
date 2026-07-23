import { formatDistanceToNow, format } from "date-fns";

export function formatTimestamp(ms: number): string {
  return format(new Date(ms), "HH:mm:ss.SSS");
}

export function formatRelativeTime(ms: number): string {
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}

export function formatFullTimestamp(ms: number): string {
  return format(new Date(ms), "yyyy-MM-dd HH:mm:ss.SSS");
}
