import { DayData } from "./budgetConfig";

const PROFITABLE_DAY = "bg-emerald-950/40 hover:bg-emerald-900/50";
const UNPROFITABLE_DAY = "bg-rose-950/30 hover:bg-rose-900/40";

interface Props {
  days: DayData[];
  selectedDayIndex: number | null;
  inputMode: "earn" | "deduct" | null;
  onSelectDay: (index: number) => void;
}

export default function DayGrid({ days, selectedDayIndex, inputMode, onSelectDay }: Props) {
  return (
    <div
      style={{ width: "30%" }}
      className="fixed top-6 left-4 bg-slate-900/90 rounded-2xl p-3 backdrop-blur-md shadow-2xl z-20"
    >
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const earned = day.earnings > 0;
          const isSelected = selectedDayIndex === idx && inputMode === "earn";
          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDay(idx)}
              className={`aspect-square flex flex-col items-center justify-center p-1 rounded-md text-center transition-all focus:outline-none ${
                isSelected
                  ? `ring-2 ring-slate-600`
                  : earned
                  ? `${PROFITABLE_DAY} text-emerald-300`
                  : `${UNPROFITABLE_DAY} text-rose-300`
              }`}
            >
              <span className="text-[9px] text-slate-400 leading-none">{day.displayDate}</span>
              <span className="text-xs font-semibold mt-1">${day.earnings}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}