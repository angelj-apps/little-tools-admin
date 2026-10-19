export function TempGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 70 ? "warm" : clamped <= 40 ? "cool" : "balanced";

  return (
    <div className={`temp-gauge temp-${tone}`} aria-label={`Community temperature ${clamped}%`}>
      <div className="temp-track">
        <div className="temp-fill" style={{ width: `${clamped}%` }} />
        <div className="temp-knob" style={{ left: `${clamped}%` }} />
      </div>
      <div className="temp-meta">
        <strong>{clamped}°</strong>
        <span>
          {tone === "warm"
            ? "Crowd is cheering tools"
            : tone === "cool"
              ? "Crowd is skeptical"
              : "Mixed reception"}
        </span>
      </div>
    </div>
  );
}
