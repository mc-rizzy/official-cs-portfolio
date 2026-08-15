"use client";

import { useState, useMemo } from "react";
import CursorWrapper from "../components/cursorWrapper";
import DayGrid from "./DayGrid";
import WeeklyProfitChart from "./WeeklyProfit";
import SankeyFlow from "./SankeyFlow";
import { generateInitialDays, COLOR_TOTAL_GREEN } from "./budgetConfig";
import AmountInput from "./AmountInput";
import { useBudgetStorage } from "./useBudgetStorage";

export default function Budgeter() {
    const { days, setDays, categoryExpenses, setCategoryExpenses, isLoaded } =
    useBudgetStorage();

    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const [targetCategory, setTargetCategory] = useState<string | null>(null);
    const [activeInput, setActiveInput] = useState<string>("");
    const [inputMode, setInputMode] = useState<"earn" | "deduct" | null>(null);

    const totalEarnings = useMemo(() => {
        return days.reduce((acc: any, curr: { earnings: any; }) => acc + curr.earnings, 0);
    }, [days]);

    const totalSpent = useMemo(() => {
        return Object.values(categoryExpenses).reduce((acc, curr) => acc as any + curr, 0);
    }, [categoryExpenses]);

    const netTotal = useMemo(
        () => totalEarnings - (totalSpent as any),
        [totalEarnings, totalSpent]
    );

    const currentWeekDays = useMemo(() => days.slice(-7), [days]);

    const handleSelectDay = (index: number) => {
        setSelectedDayIndex(index);
        setInputMode("earn");
        setTargetCategory(null);
        setActiveInput(days[index].earnings.toString());
    };

    const handleSelectCategory = (categoryName: string) => {
        setInputMode("deduct");
        setTargetCategory(categoryName);
        setSelectedDayIndex(null);
        setActiveInput("");
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(activeInput) || 0;

        if (inputMode === "earn" && selectedDayIndex !== null) {
        setDays((prev: any) => {
            const updated = [...prev];
            updated[selectedDayIndex].earnings = Math.max(0, amount);
            return updated;
        });
        } else if (inputMode === "deduct" && targetCategory) {
        if (amount > 0) {
            setCategoryExpenses((prev: { [x: string]: any; }) => ({
            ...prev,
            [targetCategory]: (prev[targetCategory] || 0) + amount,
            }));
        }
        }

        setActiveInput("");
        setInputMode(null);
        setSelectedDayIndex(null);
        setTargetCategory(null);
    };
  
    const weeklyEarnings = useMemo(() => {
        return currentWeekDays.reduce((acc: any, curr: { earnings: any; }) => acc + curr.earnings, 0);
    }, [currentWeekDays]);

    if (!isLoaded) {
        return <div className="min-h-screen bg-slate-950" />;
    }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 p-4 font-sans overflow-hidden">
      <CursorWrapper />

      <div className="fixed top-6 right-6 flex items-baseline gap-2 text-right pointer-events-none z-20">
        <span
          style={{ color: COLOR_TOTAL_GREEN }}
          className="uppercase tracking-widest font-semibold text-xl"
        >
          {netTotal.toLocaleString()}
        </span>
      </div>

      <DayGrid
        days={days}
        selectedDayIndex={selectedDayIndex}
        inputMode={inputMode}
        onSelectDay={handleSelectDay}
      />

      <WeeklyProfitChart currentWeekDays={currentWeekDays} />

      <SankeyFlow
        weeklyEarnings={weeklyEarnings}
        totalEarnings={totalEarnings}
        categoryExpenses={categoryExpenses}
        onSelectCategory={handleSelectCategory}
      />

      <AmountInput
        inputMode={inputMode}
        activeInput={activeInput}
        targetCategory={targetCategory}
        selectedDayDisplayDate={
          selectedDayIndex !== null ? days[selectedDayIndex].displayDate : undefined
        }
        onChangeInput={setActiveInput}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}