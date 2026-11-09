import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Diagram({
  label,
  width = 920,
  height = 430,
  scrollable = true,
  children,
}: {
  label: string;
  width?: number;
  height?: number;
  scrollable?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card", scrollable && "overflow-x-auto")}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className={cn("block h-auto w-full", scrollable && "min-w-[46rem]")}
      >
        <defs>
          <marker
            id="diagram-arrow"
            viewBox="0 0 10 10"
            refX={8.5}
            refY={5}
            markerWidth={6.5}
            markerHeight={6.5}
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--muted-foreground)" />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  );
}

export function DiagramZone({
  x,
  y,
  w,
  h,
  label,
  note,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="var(--muted)"
        fillOpacity={0.35}
        stroke="var(--border)"
        strokeDasharray="6 4"
      />
      <text
        x={x + 14}
        y={y + 21}
        fontSize={11}
        fontWeight={600}
        letterSpacing={1}
        fill="var(--muted-foreground)"
      >
        {label}
      </text>
      {note ? (
        <text x={x + 14} y={y + 36} fontSize={9.5} fill="var(--muted-foreground)">
          {note}
        </text>
      ) : null}
    </g>
  );
}

export function DiagramNode({
  x,
  y,
  w = 160,
  h = 52,
  main,
  sub,
  lines,
  kind = "card",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  main: string;
  sub?: string;
  lines?: string[];
  kind?: "card" | "primary" | "success";
}) {
  const stroke =
    kind === "primary" ? "var(--primary)" : kind === "success" ? "var(--success)" : "var(--input)";
  const majorFill =
    kind === "primary"
      ? "var(--primary)"
      : kind === "success"
        ? "var(--success)"
        : "var(--foreground)";
  const rows: Array<{ text: string; major: boolean }> = [{ text: main, major: true }];
  if (sub) rows.push({ text: sub, major: false });
  for (const line of lines ?? []) rows.push({ text: line, major: false });
  const mid = (rows.length - 1) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="var(--card)" stroke={stroke} />
      {rows.map((row, i) => (
        <text
          key={row.text}
          x={x + w / 2}
          y={y + h / 2 + (i - mid) * 17 + 4}
          textAnchor="middle"
          fontSize={row.major ? 13 : 10.5}
          fontWeight={row.major ? 500 : 400}
          fill={row.major ? majorFill : "var(--muted-foreground)"}
        >
          {row.text}
        </text>
      ))}
    </g>
  );
}

export function DiagramEdge({
  points,
  dashed = false,
  label,
  labelAt,
}: {
  points: [number, number][];
  dashed?: boolean;
  label?: string;
  labelAt?: [number, number];
}) {
  return (
    <g>
      <polyline
        points={points.map(([px, py]) => `${px},${py}`).join(" ")}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={1.5}
        strokeDasharray={dashed ? "5 4" : undefined}
        markerEnd="url(#diagram-arrow)"
      />
      {label && labelAt ? (
        <text
          x={labelAt[0]}
          y={labelAt[1]}
          textAnchor="middle"
          fontSize={10}
          fill="var(--muted-foreground)"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
