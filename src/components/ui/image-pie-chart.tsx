"use client";

import { useState, useId, useMemo, useRef } from "react";

export interface PieSlice {
  name: string;
  value: number;
  imageUrl?: string;
  color: string;
}

interface ImagePieChartProps {
  data: PieSlice[];
  size?: number;
  tooltipUnit?: string;
}

const DEG = Math.PI / 180;

export function ImagePieChart({
  data,
  size = 280,
  tooltipUnit = "entries",
}: ImagePieChartProps) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  // Coerce values to numbers defensively (SQL count(*) can return strings)
  const numericData = useMemo(
    () => data.map((d) => ({ ...d, value: Number(d.value) || 0 })),
    [data]
  );
  const total = useMemo(
    () => numericData.reduce((s, d) => s + d.value, 0),
    [numericData]
  );
  const R = size / 2;
  const cx = R;
  const cy = R;

  const slices = useMemo(() => {
    let cum = 0;
    return numericData.map((d, i) => {
      const sweep = total > 0 ? (d.value / total) * 360 : 0;
      const start = cum;
      cum += sweep;
      const end = cum;
      const mid = (start + end) / 2;
      const midRad = (mid - 90) * DEG;

      // Label at 65% of radius along midline
      const labelR = R * 0.65;

      // Image center at ~55% of radius along midline
      const imgDist = R * 0.55;
      const imgCX = cx + imgDist * Math.cos(midRad);
      const imgCY = cy + imgDist * Math.sin(midRad);

      return {
        ...d,
        i,
        start,
        end,
        mid,
        midRad,
        percent: total > 0 ? d.value / total : 0,
        lx: cx + labelR * Math.cos(midRad),
        ly: cy + labelR * Math.sin(midRad),
        imgCX,
        imgCY,
      };
    });
  }, [numericData, total, R, cx, cy]);

  function wedge(s: number, e: number) {
    if (e - s >= 359.99) {
      return [
        `M ${cx} ${cy - R}`,
        `A ${R} ${R} 0 1 1 ${cx - 0.001} ${cy - R}`,
        "Z",
      ].join(" ");
    }
    const sr = (s - 90) * DEG;
    const er = (e - 90) * DEG;
    const x1 = cx + R * Math.cos(sr);
    const y1 = cy + R * Math.sin(sr);
    const x2 = cx + R * Math.cos(er);
    const y2 = cy + R * Math.sin(er);
    const large = e - s > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  function handleMouse(e: React.MouseEvent, index: number | null) {
    if (index === null) {
      setTooltip(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      index,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div ref={containerRef} className="relative flex justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          {slices.map((sl) =>
            sl.imageUrl ? (
              <clipPath key={`clip-${sl.i}`} id={`${uid}-c-${sl.i}`}>
                <path d={wedge(sl.start, sl.end)} />
              </clipPath>
            ) : null
          )}
        </defs>

        {/* Filled slices */}
        {slices.map((sl) => {
          const d = wedge(sl.start, sl.end);

          if (!sl.imageUrl) {
            // Solid color for "Other" or fallback
            return (
              <path
                key={sl.i}
                d={d}
                fill={sl.color}
                stroke="var(--background)"
                strokeWidth={2.5}
              />
            );
          }

          // Full-diameter image, offset toward the wedge center so each
          // slice shows its own card face. clipPath does the shaping.
          const imgW = size;
          const imgH = size;
          const offset = R * 0.35;
          const imgX = cx + offset * Math.cos(sl.midRad) - imgW / 2;
          const imgY = cy + offset * Math.sin(sl.midRad) - imgH / 2;

          return (
            <g key={sl.i}>
              <g clipPath={`url(#${uid}-c-${sl.i})`}>
                <image
                  href={sl.imageUrl}
                  x={imgX}
                  y={imgY}
                  width={imgW}
                  height={imgH}
                  preserveAspectRatio="xMidYMid slice"
                />
                {/* Dark overlay for text readability */}
                <path d={d} fill="rgba(0,0,0,0.25)" />
              </g>
              {/* Border between slices */}
              <path d={d} fill="none" stroke="var(--background)" strokeWidth={2.5} />
            </g>
          );
        })}

        {/* Percentage labels */}
        {slices.map((sl) => {
          if (sl.percent < 0.05) return null;
          return (
            <text
              key={`lbl-${sl.i}`}
              x={sl.lx}
              y={sl.ly}
              fill="#fff"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={700}
              style={{
                textShadow:
                  "0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.6)",
              }}
            >
              {`${(sl.percent * 100).toFixed(1)}%`}
            </text>
          );
        })}

        {/* Invisible hover targets on top */}
        {slices.map((sl) => (
          <path
            key={`h-${sl.i}`}
            d={wedge(sl.start, sl.end)}
            fill="transparent"
            onMouseEnter={(e) => handleMouse(e, sl.i)}
            onMouseMove={(e) => handleMouse(e, sl.i)}
            onMouseLeave={() => setTooltip(null)}
            className="cursor-pointer"
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip !== null && slices[tooltip.index] && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl text-sm whitespace-nowrap"
          style={{
            left: tooltip.x,
            top: tooltip.y - 52,
            transform: "translateX(-50%)",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <p className="font-semibold text-foreground">
            {slices[tooltip.index].name}
          </p>
          <p className="text-xs text-muted-foreground">
            {slices[tooltip.index].value}{" "}
            {slices[tooltip.index].value === 1
              ? tooltipUnit.replace(/s$/, "")
              : tooltipUnit}{" "}
            ({(slices[tooltip.index].percent * 100).toFixed(1)}%)
          </p>
        </div>
      )}
    </div>
  );
}
