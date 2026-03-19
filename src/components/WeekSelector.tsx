type WeekSelectorProps = {
  availableWeeks: number[];
  selectedWeek: number;
  suggestedWeek: number;
  onChange: (week: number) => void;
  onUseSuggested: () => void;
};

export function WeekSelector({
  availableWeeks,
  selectedWeek,
  suggestedWeek,
  onChange,
  onUseSuggested,
}: WeekSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="week-select" className="block text-sm font-semibold text-slate-800">
            Semana activa
          </label>
          <select
            id="week-select"
            value={selectedWeek}
            onChange={(event) => onChange(Number(event.target.value))}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                Semana {week}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="rounded-xl border border-brand-700 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          onClick={onUseSuggested}
        >
          Usar sugerencia (Semana {suggestedWeek})
        </button>
      </div>
    </section>
  );
}
