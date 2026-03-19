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
  const currentIndex = availableWeeks.indexOf(selectedWeek);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < availableWeeks.length - 1;

  function goPrev() {
    if (!hasPrev) return;
    onChange(availableWeeks[currentIndex - 1]);
  }

  function goNext() {
    if (!hasNext) return;
    onChange(availableWeeks[currentIndex + 1]);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Semana activa: {selectedWeek}</p>
          <button
            type="button"
            className="rounded-xl border border-brand-700 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
            onClick={onUseSuggested}
          >
            Ir a sugerida (Semana {suggestedWeek})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {availableWeeks.map((week) => {
            const isActive = week === selectedWeek;
            return (
              <button
                key={week}
                type="button"
                onClick={() => onChange(week)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Semana {week}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
