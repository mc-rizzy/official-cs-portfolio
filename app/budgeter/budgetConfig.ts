export const COLOR_TOTAL_GREEN = "rgba(146, 146, 146, 0.46)";
export const COLOR_REVENUE = "#10b981";
export const COLOR_DEPOSIT = "#3b82f6";
export const COLOR_HYSA = "#10b981";
export const COLOR_INDEX = "#8b5cf6";
export const COLOR_TITHE = "#f59e0b";
export const COLOR_FREE = "#ec4899";

export const COLOR_GOAL_BEHIND = "#f43f5e";
export const COLOR_GOAL_ON_TRACK = "#f59e0b";
export const COLOR_GOAL_MET = "#10b981";

export const PROFIT_GOAL = 75;
export const PROFIT_DEADLINE = 5; //5 days to achieve goal, from Mon - Fri. Sat and Sun off

export const STORAGE_KEY = "budgeter";

export const Standard_Allocations: Record<string, number> = {
  tithe: 0.10,
  hysa: 0.20,
  index: 0.30,
  deposit: 0.20,
  free: 0.20,
};

export const Surplus_Allocations: Record<string, number> = {
  tithe: 0,
  hysa: 0,
  index: 0.33,
  deposit: 0,
  free: 0.67,
};

export const CATEGORIES = [
  { name: "Free", key: "free", color: COLOR_FREE },
  { name: "Tithe", key: "tithe", color: COLOR_TITHE },
  { name: "Index", key: "index", color: COLOR_INDEX },
  { name: "HYSA", key: "hysa", color: COLOR_HYSA },
  { name: "Deposit", key: "deposit", color: COLOR_DEPOSIT },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Revenue: COLOR_REVENUE,
  ...Object.fromEntries(CATEGORIES.map((cat) => [cat.name, cat.color])),
};

export interface DayData {
  dateStr: string;
  displayDate: string;
  dayName: string;
  earnings: number;
}

export const generateInitialDays = (): DayData[] => {
  const days: DayData[] = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  const daysSinceMonday = (currentDayOfWeek + 6) % 7;
  const totalDaysToStart = daysSinceMonday + 21;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDaysToStart);
  const TOTAL_DAYS = 28;

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    days.push({
      dateStr: d.toISOString().split("T")[0],
      displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      earnings: 0,
    });
  }

  return days;
};


export interface StoredDayData {
  dateStr: string; // Used as the unique "Day TimeCode" identifier (YYYY-MM-DD)
  earnings: number;
}

export interface CategoryExpenseMap {
  [categoryName: string]: number;
}

export interface MasterStorageState {
  totalEarnings: number;
  categoryExpenses: CategoryExpenseMap;
  days: StoredDayData[];
}