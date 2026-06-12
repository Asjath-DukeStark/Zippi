/** Lightweight dependency-free SVG charts for the dashboard. */

export function BarLineChart({ data, height = 220 }: {
  data: { date: string; orders: number; revenue: number }[];
  height?: number;
}) {
  if (!data.length) return null;
  const W = 760, H = height, PAD = { t: 16, r: 44, b: 28, l: 36 };
  const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
  const maxOrders = Math.max(1, ...data.map((d) => d.orders));
  const maxRev = Math.max(1, ...data.map((d) => d.revenue));
  const bw = Math.min(28, (iw / data.length) * 0.6);
  const x = (i: number) => PAD.l + (iw / data.length) * (i + 0.5);

  const revPts = data.map((d, i) => `${x(i)},${PAD.t + ih - (d.revenue / maxRev) * ih}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ih - f * ih} y2={PAD.t + ih - f * ih} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={PAD.l - 6} y={PAD.t + ih - f * ih + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(f * maxOrders)}</text>
          <text x={W - PAD.r + 6} y={PAD.t + ih - f * ih + 4} fontSize="10" fill="#16a34a">{Math.round(f * maxRev)}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <rect key={d.date} x={x(i) - bw / 2} y={PAD.t + ih - (d.orders / maxOrders) * ih}
          width={bw} height={(d.orders / maxOrders) * ih} rx="3" fill="#bfdbfe">
          <title>{`${d.date}: ${d.orders} orders`}</title>
        </rect>
      ))}
      <polyline points={revPts} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={PAD.t + ih - (d.revenue / maxRev) * ih} r="3" fill="#16a34a">
          <title>{`${d.date}: ${d.revenue.toFixed(2)} revenue`}</title>
        </circle>
      ))}
      {data.map((d, i) =>
        (data.length <= 14 || i % Math.ceil(data.length / 14) === 0) ? (
          <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.date.slice(5)}</text>
        ) : null
      )}
      <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ih} y2={PAD.t + ih} stroke="#cbd5e1" />
    </svg>
  );
}
