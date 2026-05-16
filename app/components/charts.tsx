"use client";

import { money } from "../lib/format";
import type { ChartMonthPoint, RevenueMonthPoint } from "../lib/chart-data";

const CHART_WIDTH = 420;
const CHART_HEIGHT = 200;
const PADDING = { top: 12, right: 8, bottom: 36, left: 8 };
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

/** Per-month bar colors (clients onboarded). */
const BAR_PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#3b82f6"] as const;

/** Stacked revenue segments (bars + legend must use the same values). */
export const REVENUE_CLIENT_COLOR = "#6366f1";
export const REVENUE_RENTAL_COLOR = "#f59e0b";

function ChartLegendSwatch({ color }: { color: string }) {
  return <span className="chart-legend__swatch" style={{ backgroundColor: color }} aria-hidden />;
}

type BarChartProps = {
  title: string;
  description?: string;
  points: ChartMonthPoint[];
  formatValue?: (value: number) => string;
  emptyLabel?: string;
};

type RevenueChartProps = {
  title: string;
  description?: string;
  points: RevenueMonthPoint[];
  emptyLabel?: string;
};

function maxValue(values: number[]) {
  return Math.max(...values, 1);
}

export function BarChart({
  title,
  description,
  points,
  formatValue = (value) => String(value),
  emptyLabel = "No data in this period yet.",
}: BarChartProps) {
  const peak = maxValue(points.map((point) => point.value));
  const hasData = points.some((point) => point.value > 0);
  const barGap = 10;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const barWidth = (plotWidth - barGap * (points.length - 1)) / Math.max(points.length, 1);
  const baseline = PADDING.top + PLOT_HEIGHT;

  return (
    <article className="chart-card">
      <header className="chart-card__head">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </header>

      {!hasData ? (
        <p className="chart-card__empty">{emptyLabel}</p>
      ) : (
        <div className="chart-card__plot">
          <svg
            className="chart-svg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={title}
          >
            <line
              className="chart-svg__baseline"
              x1={PADDING.left}
              y1={baseline}
              x2={CHART_WIDTH - PADDING.right}
              y2={baseline}
            />
            {points.map((point, index) => {
              const barHeight = (point.value / peak) * PLOT_HEIGHT;
              const x = PADDING.left + index * (barWidth + barGap);
              const y = baseline - barHeight;

              return (
                <g key={point.key}>
                  <rect
                    className="chart-svg__bar"
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, point.value > 0 ? 4 : 0)}
                    rx={4}
                    fill={BAR_PALETTE[index % BAR_PALETTE.length]}
                  />
                  <text className="chart-svg__value" x={x + barWidth / 2} y={y - 6} textAnchor="middle">
                    {formatValue(point.value)}
                  </text>
                  <text className="chart-svg__label" x={x + barWidth / 2} y={baseline + 18} textAnchor="middle">
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </article>
  );
}

export function RevenueBarChart({ title, description, points, emptyLabel }: RevenueChartProps) {
  const peak = maxValue(points.map((point) => point.value));
  const hasData = points.some((point) => point.value > 0);
  const barGap = 10;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const barWidth = (plotWidth - barGap * (points.length - 1)) / Math.max(points.length, 1);
  const baseline = PADDING.top + PLOT_HEIGHT;

  return (
    <article className="chart-card">
      <header className="chart-card__head">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <ul className="chart-legend" aria-hidden={!hasData}>
          <li>
            <ChartLegendSwatch color={REVENUE_CLIENT_COLOR} />
            Client payments
          </li>
          <li>
            <ChartLegendSwatch color={REVENUE_RENTAL_COLOR} />
            Rental payments
          </li>
        </ul>
      </header>

      {!hasData ? (
        <p className="chart-card__empty">{emptyLabel ?? "No revenue recorded in this period yet."}</p>
      ) : (
        <div className="chart-card__plot">
          <svg
            className="chart-svg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label={title}
          >
            <line
              className="chart-svg__baseline"
              x1={PADDING.left}
              y1={baseline}
              x2={CHART_WIDTH - PADDING.right}
              y2={baseline}
            />
            {points.map((point, index) => {
              const totalHeight = (point.value / peak) * PLOT_HEIGHT;
              const clientHeight = point.value > 0 ? (point.clientRevenue / point.value) * totalHeight : 0;
              const rentalHeight = totalHeight - clientHeight;
              const x = PADDING.left + index * (barWidth + barGap);
              const rentalY = baseline - rentalHeight;
              const clientY = rentalY - clientHeight;

              return (
                <g key={point.key}>
                  {rentalHeight > 0 ? (
                    <rect
                      className="chart-svg__bar"
                      x={x}
                      y={rentalY}
                      width={barWidth}
                      height={rentalHeight}
                      rx={clientHeight > 0 ? 0 : 4}
                      fill={REVENUE_RENTAL_COLOR}
                    />
                  ) : null}
                  {clientHeight > 0 ? (
                    <rect
                      className="chart-svg__bar"
                      x={x}
                      y={clientY}
                      width={barWidth}
                      height={clientHeight}
                      rx={4}
                      fill={REVENUE_CLIENT_COLOR}
                    />
                  ) : null}
                  {point.value > 0 ? (
                    <text className="chart-svg__value" x={x + barWidth / 2} y={clientY - 6} textAnchor="middle">
                      {money(point.value)}
                    </text>
                  ) : null}
                  <text className="chart-svg__label" x={x + barWidth / 2} y={baseline + 18} textAnchor="middle">
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </article>
  );
}
