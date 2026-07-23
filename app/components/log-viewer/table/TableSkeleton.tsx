import {
  CHEVRON_WIDTH,
  SEVERITY_WIDTH,
  TIME_WIDTH,
  SERVICE_WIDTH,
} from "./logTableLayout";

const ROW_COUNT = 40;
const BODY_WIDTHS_PCT = [
  70, 55, 85, 60, 45, 75, 65, 50, 80, 60, 70, 55, 65, 45,
];

function SkeletonBar({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800 rounded animate-pulse ${className}`}
      style={style}
    />
  );
}

export function TableSkeleton() {
  return (
    <div className="h-full overflow-hidden">
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex items-center border-b border-gray-100 dark:border-gray-800 py-2.5"
        >
          <div style={{ width: CHEVRON_WIDTH }} className="flex-shrink-0" />
          <div style={{ width: SEVERITY_WIDTH }} className="flex-shrink-0 pr-3">
            <SkeletonBar className="h-4 w-14" />
          </div>
          <div style={{ width: TIME_WIDTH }} className="flex-shrink-0 pr-4">
            <SkeletonBar className="h-3 w-20" />
          </div>
          <div style={{ width: SERVICE_WIDTH }} className="flex-shrink-0 pr-4">
            <SkeletonBar className="h-3 w-16" />
          </div>
          <div className="flex-1 min-w-0 pr-3">
            <SkeletonBar
              className="h-3"
              style={{
                width: `${BODY_WIDTHS_PCT[i % BODY_WIDTHS_PCT.length]}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
