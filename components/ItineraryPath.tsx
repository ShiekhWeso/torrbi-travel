const H = 160; // row height in px, matches h-40
const icons = ['landscape', 'photo_camera', 'restaurant', 'sailing', 'local_activity'];
const tones = ['bg-brand-warm text-navy', 'bg-sky text-snow', 'bg-[#F2C14E] text-navy', 'bg-navy text-snow'];

export default function ItineraryPath({steps}: {steps: {title: string; text: string}[]}) {
  const n = steps.length;
  const ys = steps.map((_, i) => i * H + H / 2);
  let d = `M50 ${ys[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    d += ` C${50 + 60 * s} ${ys[i] + H * 0.3} ${50 - 60 * s} ${ys[i] + H * 0.7} 50 ${ys[i + 1]}`;
  }

  return (
    <div dir="ltr" className="relative mt-8">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${n * H}`}
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="roadGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={n * H}>
            <stop offset="0" stopColor="#FE9962" />
            <stop offset="0.5" stopColor="#F2C14E" />
            <stop offset="1" stopColor="#0A7FD0" />
          </linearGradient>
        </defs>
        <path d={d} stroke="url(#roadGrad)" strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={d} stroke="#fff" strokeWidth="2" strokeDasharray="2 12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {steps.map((s, i) => {
        const left = i % 2 === 0;
        const icon = i === 0 ? 'airport_shuttle' : i === n - 1 ? 'hotel' : icons[(i - 1) % icons.length];
        return (
          <div key={i} className="relative grid h-40 grid-cols-[1fr_48px_1fr] items-center gap-2 sm:grid-cols-[1fr_64px_1fr]">
            <div
              dir="auto"
              className={`row-start-1 rounded-2xl border border-navy/5 bg-snow p-3 shadow-[0_8px_24px_rgba(15,24,89,0.1)] sm:p-4 ${
                left ? 'col-start-1 text-right' : 'col-start-3 text-left'
              }`}
            >
              <h3 className="text-sm font-bold text-navy sm:text-base">{s.title}</h3>
              <p className="mt-1 text-xs text-navy/70 sm:text-sm">{s.text}</p>
            </div>
            <span
              className={`col-start-2 row-start-1 flex h-12 w-12 items-center justify-center rounded-full shadow-lg ring-4 ring-snow sm:h-16 sm:w-16 ${tones[i % tones.length]}`}
            >
              <span className="material-symbols-outlined text-[24px] sm:text-[30px]">{icon}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}