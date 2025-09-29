"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  DoughnutController,
} from "chart.js";

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export type Slice = {
  label: string;   // 党名
  value: number;   // 議席 or 得票率(%) の値
  color: string;   // 表示色
};

type Props = {
  title?: string;        // 上の見出し
  unit?: string;         // "議席" か "%" など
  slices: Slice[];
  height?: number;       // px（canvas高さ）
  showLegend?: boolean;  // 凡例表示
  cutout?: string;       // 中抜き率。例 "60%"
};

export default function ElectionHalfDonut({
  title = "議席獲得状況",
  unit = "議席",
  slices,
  height = 260,
  showLegend = true,
  cutout = "60%",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);

  const total = useMemo(
    () => slices.reduce((sum, s) => sum + (Number.isFinite(s.value) ? s.value : 0), 0),
    [slices]
  );

  const data: ChartData<"doughnut"> = useMemo(() => {
    return {
      labels: slices.map((s) => s.label),
      datasets: [
        {
          data: slices.map((s) => s.value),
          backgroundColor: slices.map((s) => s.color),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [slices]);

  const options: ChartOptions<"doughnut"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      rotation: -90,        // 上から開始
      circumference: 180,   // 半円
      cutout,
      plugins: {
        legend: {
          display: showLegend,
          position: "bottom",
          labels: { boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const v = Number(ctx.parsed);
              const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
              return `${label}: ${v} ${unit}（${pct}%）`;
            },
          },
        },
      },
      layout: { padding: 8 },
    };
  }, [showLegend, cutout, unit, total]);

  // 中央に合計値を描くカスタムプラグイン
  useEffect(() => {
    const plugin = {
      id: "centerText",
      afterDraw: (chart: Chart) => {
        const { ctx, chartArea } = chart;
        if (!ctx || !chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = chartArea.top + (chartArea.bottom - chartArea.top) * 0.9; // 半円なので少し下
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "600 14px system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans JP', sans-serif";
        ctx.fillStyle = "#111827";
        ctx.fillText(`${title}`, cx, chartArea.top - 8);

        ctx.font = "700 20px system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans JP', sans-serif";
        ctx.fillStyle = "#111827";
        ctx.fillText(`${total} ${unit}`, cx, cy);
        ctx.restore();
      },
    };

    Chart.register(plugin);
    return () => {
      Chart.unregister(plugin);
    };
  }, [title, total, unit]);

  // 描画・再描画
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    // 既存インスタンス破棄（再レンダー対策）
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(el, {
      type: "doughnut",
      data,
      options,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, options]);

  return (
    <div className="w-full rounded-2xl border bg-white p-4">
      <div style={{ height }}>
        <canvas ref={canvasRef} />
      </div>

      {/* ラベルの色見本（凡例OFF時の代替） */}
      {!showLegend && (
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {slices.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
