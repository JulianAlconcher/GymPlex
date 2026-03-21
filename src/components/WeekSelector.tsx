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
    <section className="bg-surface-low shadow-xl">
      <div className="flex flex-col gap-4 border-l-2 border-primary bg-surface-highest p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tighter text-on-surface">
            MATRIZ ACTIVA: SEMANA {selectedWeek}
          </h2>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60">
            SELECCIONA EL BLOQUE DE ENTRENAMIENTO
          </p>
        </div>
        <button
          type="button"
          className="border border-primary px-6 py-3 font-display text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
          onClick={onUseSuggested}
        >
          Ir a Toca: Sem {suggestedWeek}
        </button>
      </div>

      <div className="p-6">
        <div className="mb-6 flex justify-between gap-2 border-b border-surface-highest pb-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="border-b-2 border-transparent px-2 py-1 font-display uppercase tracking-widest text-on-surface/70 transition-colors hover:border-outline-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← PREV
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="border-b-2 border-transparent px-2 py-1 font-display uppercase tracking-widest text-on-surface/70 transition-colors hover:border-outline-variant hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            NEXT →
          </button>
        </div>

        <div className="grid grid-cols-4 gap-[2px] bg-surface-highest p-[2px] sm:grid-cols-6 lg:grid-cols-10">
          {availableWeeks.map((week) => {
            const isActive = week === selectedWeek;
            return (
              <button
                key={week}
                type="button"
                onClick={() => onChange(week)}
                className={`flex flex-col items-center justify-center p-3 font-display text-lg font-bold transition-colors ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-container to-inverse-primary text-white'
                    : 'bg-surface hover:bg-surface-low text-on-surface'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest opacity-60">WK</span>
                {week}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
