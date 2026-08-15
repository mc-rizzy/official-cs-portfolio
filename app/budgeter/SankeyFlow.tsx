import { useMemo } from "react";
import { ResponsiveSankey } from "@nivo/sankey";
import { CATEGORIES, Standard_Allocations, Surplus_Allocations, CATEGORY_COLORS, COLOR_REVENUE, PROFIT_GOAL } from "./budgetConfig";

interface Props {
  weeklyEarnings: number;
  totalEarnings: number;
  categoryExpenses: Record<string, number>;
  onSelectCategory: (categoryName: string) => void;
}

export default function SankeyFlow({ weeklyEarnings, totalEarnings, categoryExpenses, onSelectCategory }: Props) {
  const categoryData = useMemo(() => {
    return CATEGORIES.map((cat) => {

      const weeklyDeduction = Math.min(weeklyEarnings, PROFIT_GOAL);
      const surplus = Math.max(0, weeklyEarnings - PROFIT_GOAL);

      const allocated = weeklyDeduction * Standard_Allocations[cat.key] + surplus * Surplus_Allocations[cat.key];

      const spent = categoryExpenses[cat.name] || 0;
      const remaining = Math.max(0, allocated - spent);
      return { name: cat.name, value: Number(remaining.toFixed(2)) };
    });
  }, [weeklyEarnings, categoryExpenses]);

  const sankeyData = useMemo(() => {
    return {
      nodes: [{ id: "Revenue" }, ...CATEGORIES.map((cat) => ({ id: cat.name }))],
      links: categoryData.map((item) => ({
        source: "Revenue",
        target: item.name,
        value: Math.max(0.01, item.value),
      })),
    };
  }, [categoryData]);

  return (
    <div className="fixed top-20 right-6 w-[45vw] h-[50vh] bg-transparent pointer-events-auto z-10">
      <ResponsiveSankey
        data={sankeyData}
        label={(node) =>
          node.id === "Free" ? `${node.value.toLocaleString()} ${node.id}` : node.id
        }
        onClick={(data) => {
          if ("id" in data && data.id !== "Revenue") {
            onSelectCategory(data.id as string);
          }
        }}
        margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
        align="justify"
        colors={(node) => CATEGORY_COLORS[node.id] || COLOR_REVENUE}
        nodeOpacity={1}
        nodeThickness={12}
        nodeSpacing={18}
        nodeBorderWidth={0}
        linkOpacity={0.3}
        enableLabels={true}
        labelPadding={12}
        labelTextColor="#94a3b8"
        theme={{
          labels: { text: { fontSize: 12, fontWeight: 600, cursor: "pointer" } },
          tooltip: {
            container: {
              background: "#0f172a",
              color: "#f8fafc",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid #334155",
            },
          },
        }}
      />
    </div>
  );
}