"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme/ThemeProvider";

function useChartColors() {
  const { theme } = useTheme();
  const [colors, setColors] = useState({
    grid: "#27272a",
    tick: "#71717a",
    tooltipBg: "#09090b",
    tooltipBorder: "#27272a",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setColors({
      grid: styles.getPropertyValue("--chart-grid").trim() || "#27272a",
      tick: styles.getPropertyValue("--chart-tick").trim() || "#71717a",
      tooltipBg: styles.getPropertyValue("--chart-tooltip-bg").trim() || "#09090b",
      tooltipBorder: styles.getPropertyValue("--chart-tooltip-border").trim() || "#27272a",
    });
  }, [theme]);

  return colors;
}

export function MetricChart({
  title,
  data,
  kind = "line",
  color = "#38bdf8",
  valuePrefix = "",
  valueSuffix = "",
}: {
  title: string;
  data: { day: string; value: number }[];
  kind?: "line" | "area" | "bar";
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  const chart = useChartColors();
  const tooltipStyle = {
    background: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: 8,
    fontSize: 12,
    color: chart.tick,
  };

  return (
    <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/30 p-4">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">{title}</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${valuePrefix}${v}${valueSuffix}`, title]}
              />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : kind === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${valuePrefix}${v}${valueSuffix}`, title]}
              />
              <Area type="monotone" dataKey="value" stroke={color} fill={`${color}33`} strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: chart.tick, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${valuePrefix}${v}${valueSuffix}`, title]}
              />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
