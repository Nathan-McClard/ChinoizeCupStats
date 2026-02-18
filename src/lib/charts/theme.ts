export const CHART_COLORS = [
  "#1e3a6e", // Primary navy
  "#0a84ff", // Blue
  "#af52de", // Purple
  "#ff2d55", // Pink
  "#ff9500", // Orange
  "#34c759", // Green
  "#5ac8fa", // Teal
  "#ff9f0a", // Amber
];

export const TIER_COLORS = {
  S: "#ff9f0a",
  A: "#1e3a6e",
  B: "#5ac8fa",
  C: "#636366",
  U: "#8e8e93",
} as const;

export const chartTheme = {
  background: "transparent",
  textColor: "var(--muted-foreground)",
  fontSize: 12,
  gridColor: "var(--border)",
  tooltipStyle: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--foreground)",
    fontSize: "13px",
    padding: "8px 12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  axisStyle: {
    stroke: "var(--border)",
    fontSize: 11,
    fill: "var(--muted-foreground)",
  },
};
