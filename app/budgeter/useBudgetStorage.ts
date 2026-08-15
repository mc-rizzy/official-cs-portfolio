"use client";

import { useState, useEffect, useRef } from "react";
import {
  STORAGE_KEY,
  DayData,
  MasterStorageState,
  generateInitialDays,
} from "./budgetConfig";

export function useBudgetStorage() {
  const [days, setDays] = useState<DayData[]>(generateInitialDays);
  const [categoryExpenses, setCategoryExpenses] = useState<Record<string, number>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and reconcile state on initial mount
  useEffect(() => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      const generatedDays = generateInitialDays();

      if (rawData) {
        const parsed: MasterStorageState = JSON.parse(rawData);
        const storedDaysMap = new Map(
          (parsed.days || []).map((d) => [d.dateStr, d.earnings])
        );

        // Reconcile: Keep earnings for dates that exist, assign default for new days
        // Old dates not in generatedDays automatically drop off
        const reconciledDays: DayData[] = generatedDays.map((genDay) => {
          const savedEarnings = storedDaysMap.get(genDay.dateStr);
          return {
            ...genDay,
            earnings: savedEarnings !== undefined ? savedEarnings : genDay.earnings,
          };
        });

        setDays(reconciledDays);
        if (parsed.categoryExpenses) {
          setCategoryExpenses(parsed.categoryExpenses);
        }
      } else {
        setDays(generatedDays);
      }
    } catch (error) {
      console.error("Failed to load budget data from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state whenever days or categoryExpenses change (skip initial unmounted render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isLoaded) return;

    try {
      const totalEarnings = days.reduce((acc, curr) => acc + curr.earnings, 0);

      const payload: MasterStorageState = {
        totalEarnings,
        categoryExpenses,
        days: days.map((d) => ({
          dateStr: d.dateStr,
          earnings: d.earnings,
        })),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save budget data to localStorage:", error);
    }
  }, [days, categoryExpenses, isLoaded]);

  return {
    days,
    setDays,
    categoryExpenses,
    setCategoryExpenses,
    isLoaded,
  };
}