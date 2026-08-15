import "./budget.css"

interface Props {
  inputMode: "earn" | "deduct" | null;
  activeInput: string;
  targetCategory: string | null;
  selectedDayDisplayDate?: string;
  onChangeInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AmountInput({
  inputMode,
  activeInput,
  targetCategory,
  selectedDayDisplayDate,
  onChangeInput,
  onSubmit,
}: Props) {
  const isInputVisible = inputMode !== null;

  return (
    <div
      className={`absolute top-[75vh] left-[55%] -translate-x-1/2 w-[32rem] max-w-full z-30 transition-opacity duration-300 ${
        isInputVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <form onSubmit={onSubmit} className="relative w-full flex flex-col">
        <div className="flex items-center w-full">
          <span className="text-2xl font-light text-slate-500 mr-2">$</span>
          <input
            type="number"
            step="0.01"
            autoFocus={isInputVisible}
            value={activeInput}
            onChange={(e) => onChangeInput(e.target.value)}
            className={`w-full bg-transparent text-3xl font-semibold text-white py-2 focus:outline-none transition-all ${
              inputMode === "earn"
                ? "border-b-2 border-emerald-500 focus:border-emerald-400"
                : "border-b-2 border-rose-500 focus:border-rose-400"
            }`}
          />
        </div>

        <div className="mt-2 text-xs font-medium text-slate-400">
          {inputMode === "deduct" && targetCategory && (
            <span className="text-rose-400">Deducting from {targetCategory}</span>
          )}
          {inputMode === "earn" && selectedDayDisplayDate && (
            <span className="text-emerald-400">
              Editing earnings for {selectedDayDisplayDate}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}