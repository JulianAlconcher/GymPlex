import { useMemo, useState, type FormEvent } from 'react';

import { KEY_LIFTS, ONBOARDING_RM_KEYS } from '../data/keyLifts';
import type { RmKey } from '../types/routine';

type OnboardingFormProps = {
  initialRms: Partial<Record<RmKey, number>>;
  onSave: (rms: Partial<Record<RmKey, number>>) => void;
};

export function OnboardingForm({ initialRms, onSave }: OnboardingFormProps) {
  const [draft, setDraft] = useState<Partial<Record<RmKey, number>>>(initialRms);

  const allFieldsFilled = useMemo(
    () => ONBOARDING_RM_KEYS.every((key) => typeof draft[key] === 'number' && (draft[key] ?? 0) > 0),
    [draft]
  );

  function updateValue(key: RmKey, value: string) {
    const parsed = Number(value);
    setDraft((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <section className="bg-surface-low shadow-xl">
      <div className="border-l-4 border-error bg-error/10 p-6">
         <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-error">ATENCIÓN: SISTEMA DESCALIBRADO</h2>
         <p className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-on-surface/70">
            PARA ACCEDER A LA MATRIZ DE CARGA, INICIALIZÁ LOS VALORES RM O PESOS ESTIMADOS A CONTINUACIÓN.
         </p>
      </div>

      <form className="grid gap-6 p-6 sm:grid-cols-2" onSubmit={handleSubmit}>
        {ONBOARDING_RM_KEYS.map((key) => (
          <label key={key} className="block w-full cursor-pointer">
            <span className="mb-2 block font-display text-xs font-bold uppercase tracking-widest text-on-surface/70">
              {KEY_LIFTS[key]} [KG]
            </span>
            <input
              type="number"
              min="1"
              step="0.5"
              value={draft[key] ?? ''}
              onChange={(event) => updateValue(key, event.target.value)}
              className="w-full border-b-2 border-outline-variant bg-surface px-4 py-3 font-display text-xl text-on-surface outline-none transition-colors focus:border-error focus:bg-surface-highest"
              placeholder="Ej: 100"
            />
          </label>
        ))}

        <div className="pt-6 sm:col-span-2">
          <button
            type="submit"
            disabled={!allFieldsFilled}
            className="w-full bg-gradient-to-br from-error to-error-container px-6 py-4 font-display text-base uppercase tracking-wider text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:from-surface-highest disabled:to-surface-highest disabled:text-on-surface/30 sm:w-auto"
          >
            CALIBRAR SISTEMA
          </button>
        </div>
      </form>
    </section>
  );
}
