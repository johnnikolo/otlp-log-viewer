import { SeverityLevel } from "@/types/otlp";
import { SEVERITY_COLORS } from "@/lib/utils/severity";

interface Props {
  severity: SeverityLevel;
}

export function SeverityBadge({ severity }: Props) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium ${colors.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {severity}
    </span>
  );
}
