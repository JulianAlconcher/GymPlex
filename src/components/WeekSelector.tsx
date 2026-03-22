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
    <section className="bg-surface-lowest">
      <div className="flex flex-col gap-4 border-l-[3px] border-primary bg-surface-highest p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col justify-center">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface/50 mb-1">
            TRAINING BLOCK
          </p>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tighter text-white leading-none">
            WEEK {selectedWeek}
          </h2>
        </div>
        {selectedWeek !== suggestedWeek && (
          <button
            type="button"
            className="border border-surface-highest bg-surface hover:bg-surface-low px-6 py-3 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface transition-all hover:text-white active:scale-[0.98]"
            onClick={onUseSuggested}
          >
            JUMP TO WEEK {suggestedWeek}
          </button>
        )}
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

        <div className="flex overflow-x-auto gap-[2px] bg-surface-highest p-[2px] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {availableWeeks.map((week) => {
            const isActive = week === selectedWeek;
            return (
              <button
                key={week}
                type="button"
                onClick={() => onChange(week)}
                className={`flex-none w-[22%] min-w-[70px] sm:flex-1 sm:w-auto snap-start flex flex-col items-center justify-center p-3 font-display text-lg font-bold transition-colors ${
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
