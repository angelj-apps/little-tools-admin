import type { DayBucket } from "@/lib/stats";

export function SparkBars({
  data,
  label,
}: {
  data: DayBucket[];
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="spark" aria-label={label}>
      <div className="spark-bars">
        {data.map((d) => (
          <div key={d.day} className="spark-col" title={`${d.day}: ${d.count}`}>
            <div
              className="spark-bar"
              style={{ height: `${Math.max(8, (d.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="spark-footer">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{label}</span>
        <span>{data[data.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}
