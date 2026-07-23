const BAR_HEIGHTS_PCT = [
  40, 65, 30, 55, 70, 45, 60, 35, 50, 75, 40, 65, 55, 30, 45, 70, 60, 35, 50,
  65, 40, 55, 30, 60,
];

export function HistogramSkeleton() {
  return (
    <div className="w-full h-28 flex items-end gap-1">
      {BAR_HEIGHTS_PCT.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-t animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
