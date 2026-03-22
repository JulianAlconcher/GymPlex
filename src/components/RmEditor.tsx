import { useEffect, useState } from 'react';

import { EDITABLE_RM_KEYS, KEY_LIFTS } from '../data/keyLifts';
import type { RmKey } from '../types/routine';

type RmEditorProps = {
  rms: Partial<Record<RmKey, number>>;
  onSave: (rms: Partial<Record<RmKey, number>>) => void;
};

const LIFT_META: Record<string, { title: string; subtitle: string }> = {
  squat: { title: 'SQUAT', subtitle: 'PRIMARY LEG DRIVE' },
  bench: { title: 'BENCH PRESS', subtitle: 'UPPER BODY HORIZONTAL' },
  deadlift: { title: 'DEADLIFT', subtitle: 'POSTERIOR CHAIN FOCUS' },
};

export function RmEditor({ rms, onSave }: RmEditorProps) {
  const [draft, setDraft] = useState<Partial<Record<RmKey, number>>>(rms);

  useEffect(() => {
    setDraft(rms);
  }, [rms]);

  function handleInputChange(key: RmKey, val: string) {
    const parsed = Number(val);
    setDraft((prev) => ({
      ...prev,
      [key]: !isNaN(parsed) && parsed > 0 ? parsed : undefined,
    }));
  }

  function handleSave() {
    onSave(draft);
  }

  return (
    <div className="w-full pb-8">
      <div className="space-y-4 px-4 pt-4">
        {EDITABLE_RM_KEYS.map((key) => {
          const meta = LIFT_META[key] || { title: KEY_LIFTS[key], subtitle: 'LIFT' };
          const value = draft[key] || '';

          return (
            <label
              key={key}
              className="w-full flex items-center justify-between p-5 bg-surface-highest transition-all border-l-[3px] border-primary hover:bg-surface-highest/80 cursor-text focus-within:bg-surface-low"
            >
              <div className="text-left flex flex-col justify-center">
                <span className="font-display text-lg font-bold tracking-tight uppercase text-on-surface/70">
                  {meta.title}
                </span>
                <span className="font-body text-[9px] uppercase tracking-widest text-on-surface/40 mt-1">
                  {meta.subtitle}
                </span>
              </div>
              <div className="flex items-baseline gap-1 relative justify-end">
                <input
                  type="number"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-24 text-right bg-transparent border-none font-display text-4xl font-bold tracking-tighter text-white outline-none placeholder:text-surface-lowest focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="0"
                  style={{ MozAppearance: 'textfield' }}
                />
                <span className="font-display text-xs font-bold text-on-surface/50 pointer-events-none">KG</span>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-8 px-4">
        <button
          onClick={handleSave}
          className="w-full bg-[#E50914] text-white font-display text-sm font-bold uppercase tracking-widest py-5 shadow-lg active:scale-[0.98] transition-all"
        >
          SET AS CURRENT MAX
        </button>
      </div>

      <div className="mt-10 px-6 border-l-[3px] border-surface-highest ml-4">
        <p className="font-display text-[10px] font-bold uppercase tracking-widest text-on-surface/40 flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-primary/50 block rounded-sm"></span> CALIBRATION DATA
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-surface-highest pb-2">
            <span className="font-body text-[10px] uppercase text-on-surface/40">WILKS SCORE</span>
            <span className="font-display text-base font-bold text-white">412.5</span>
          </div>
          <div className="flex justify-between items-end border-b border-surface-highest pb-2">
            <span className="font-body text-[10px] uppercase text-on-surface/40">POWERLIFTING TOTAL</span>
            <span className="font-display text-base font-bold text-white">545 KG</span>
          </div>
          <div className="flex justify-between items-end border-b border-surface-highest pb-2">
            <span className="font-body text-[10px] uppercase text-on-surface/40">LAST UPDATE</span>
            <span className="font-display text-base font-bold text-white">14.OCT.23</span>
          </div>
        </div>
      </div>
    </div>
  );
}
