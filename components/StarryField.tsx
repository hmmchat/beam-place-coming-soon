const COUNT = 96;

export function StarryField() {
  return (
    <div className="star-drift pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: COUNT }).map((_, i) => {
        const x = ((i * 47 + i * i) % 1000) / 10;
        const y = ((i * 73 + (i % 5) * 19) % 1000) / 10;
        const s = 1 + (i % 4);
        const d = ((i * 0.17) % 2.8).toFixed(2);
        const dur = (2 + (i % 5) * 0.35).toFixed(2);
        return (
          <span
            key={i}
            className="star"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              ["--twinkle-delay" as string]: `${d}s`,
              ["--twinkle-duration" as string]: `${dur}s`,
              opacity: 0.35 + (i % 5) * 0.12,
            }}
          />
        );
      })}
    </div>
  );
}
