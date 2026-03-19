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
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-amber-900">Configuración inicial</h2>
      <p className="mt-1 text-sm text-amber-800">
        Cargá tus RM (o peso estimado) para calcular automáticamente los ejercicios por porcentaje.
      </p>

      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        {ONBOARDING_RM_KEYS.map((key) => (
          <label key={key} className="block text-sm font-medium text-slate-700">
            {KEY_LIFTS[key]} (kg)
            <input
              type="number"
              min="1"
              step="0.5"
              value={draft[key] ?? ''}
              onChange={(event) => updateValue(key, event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Ej: 100"
            />
          </label>
        ))}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!allFieldsFilled}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Guardar RM
          </button>
        </div>
      </form>
    </section>
  );
}
