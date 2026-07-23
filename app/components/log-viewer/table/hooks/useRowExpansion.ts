import { useCallback, useState } from "react";

// Single-row expansion: only one row's detail panel is open at a time.
export function useRowExpansion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpandedId((cur) => (cur === id ? null : id));
  }, []);

  return { expandedId, toggle };
}
