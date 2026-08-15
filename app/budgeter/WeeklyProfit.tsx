import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  PROFIT_GOAL,
  PROFIT_DEADLINE,
  COLOR_GOAL_MET,
  COLOR_GOAL_ON_TRACK,
  COLOR_GOAL_BEHIND,
  DayData,
} from "./budgetConfig";

interface Props {
  currentWeekDays: DayData[];
}

export default function WeeklyProfitChart({ currentWeekDays }: Props) {
  const { currentWeekTotalProfit, chartLineColor } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

    // 1. Convert JavaScript day (Sun=0) to Monday-based index (Mon=1 ... Sun=7)
    const currentDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

    // 2. Cap elapsed days so they never exceed the PROFIT_DEADLINE
    const elapsedDays = Math.min(currentDayNumber, PROFIT_DEADLINE);

    // Sum earnings strictly up through today's elapsed index
    const earnedSoFar = currentWeekDays
      .slice(0, elapsedDays)
      .reduce((acc, curr) => acc + curr.earnings, 0);

    const totalWeekEarnings = currentWeekDays.reduce(
      (acc, curr) => acc + curr.earnings,
      0
    );

    // If total goal reached overall -> Green
    if (totalWeekEarnings >= PROFIT_GOAL) {
      return {
        currentWeekTotalProfit: totalWeekEarnings,
        chartLineColor: COLOR_GOAL_MET,
      };
    }

    // Dynamic expected daily benchmark
    const expectedPaceToday = (PROFIT_GOAL / PROFIT_DEADLINE) * elapsedDays;

    // Evaluate pace status
    const color =
      earnedSoFar >= expectedPaceToday
        ? COLOR_GOAL_ON_TRACK
        : COLOR_GOAL_BEHIND;

    return {
      currentWeekTotalProfit: totalWeekEarnings,
      chartLineColor: color,
    };
  }, [currentWeekDays]);

  const currentWeekChartData = useMemo(() => {
    let runningTotal = 0;
    const points = currentWeekDays.map((day) => {
      runningTotal += day.earnings;
      return { x: day.dayName, y: runningTotal };
    });

    return [{ id: "Profit", color: chartLineColor, data: points }];
  }, [currentWeekDays, chartLineColor]);

  const maxYValue = useMemo(() => {
    return Math.max(PROFIT_GOAL * 1.25, currentWeekTotalProfit * 1.1, 100);
  }, [currentWeekTotalProfit]);

  const GoalLineLayer = ({ yScale, innerWidth }: any) => {
    if (!yScale) return null;
    const yVal = yScale(PROFIT_GOAL);
    if (typeof yVal !== "number" || isNaN(yVal)) return null;

    return (
      <g style={{ pointerEvents: "none" }}>
        <line
          x1={0}
          x2={innerWidth}
          y1={yVal}
          y2={yVal}
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text
          x={innerWidth - 4}
          y={yVal - 5}
          fill="#94a3b8"
          fontSize={10}
          fontWeight={600}
          textAnchor="end"
        >
          GOAL ${PROFIT_GOAL}
        </text>
      </g>
    );
  };

  return (
    <div
      style={{ width: "30%" }}
      className="fixed top-[52vh] left-4 h-[38vh] bg-slate-900/90 rounded-2xl p-4 backdrop-blur-md shadow-2xl z-20 flex flex-col justify-between"
    >
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          This Week's Profit
        </span>
        <span
          style={{ color: chartLineColor }}
          className="text-sm font-bold transition-colors duration-300"
        >
          ${currentWeekTotalProfit.toLocaleString()} / ${PROFIT_GOAL}
        </span>
      </div>

      <div className="w-full h-full min-h-0">
        <ResponsiveLine
          data={currentWeekChartData}
          margin={{ top: 15, right: 20, bottom: 35, left: 35 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: 0, max: maxYValue }}
          curve="monotoneX"
          colors={[chartLineColor]}
          lineWidth={3}
          enablePoints={true}
          pointSize={6}
          pointColor="#0f172a"
          pointBorderWidth={2}
          pointBorderColor={chartLineColor}
          enableArea={true}
          areaOpacity={0.15}
          enableGridX={false}
          enableGridY={true}
          layers={[
            "grid",
            "markers",
            "axes",
            "areas",
            "lines",
            GoalLineLayer,
            "points",
            "slices",
            "mesh",
          ]}
          axisTop={null}
          axisRight={null}
          axisBottom={{ tickSize: 0, tickPadding: 10 }}
          axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4 }}
          theme={{
            axis: { ticks: { text: { fill: "#64748b", fontSize: 10 } } },
            grid: { line: { stroke: "#1e293b", strokeWidth: 1 } },
            tooltip: {
              container: {
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "11px",
                borderRadius: "6px",
                border: "1px solid #334155",
              },
            },
          }}
        />
      </div>
    </div>
  );
}