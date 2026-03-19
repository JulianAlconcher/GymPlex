import { useEffect, useState, type FormEvent } from 'react';

import { EDITABLE_RM_KEYS, KEY_LIFTS } from '../data/keyLifts';
import type { RmKey } from '../types/routine';

type RmEditorProps = {
  rms: Partial<Record<RmKey, number>>;
  onSave: (rms: Partial<Record<RmKey, number>>) => void;
};

export function RmEditor({ rms, onSave }: RmEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Record<RmKey, number>>>(rms);

  useEffect(() => {
    setDraft(rms);
  }, [rms]);

  function updateValue(key: RmKey, value: string) {
    const parsed = Number(value);
    setDraft((prev) => ({
      ...prev,
      [key]: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
    }));
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
    setIsOpen(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">RM del usuario</h2>
          <p className="text-xs text-slate-500">Podés editarlos cuando quieras.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {isOpen ? 'Cerrar' : 'Editar RM'}
        </button>
      </div>

      {isOpen && (
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSave}>
          {EDITABLE_RM_KEYS.map((key) => (
            <label key={key} className="block text-sm font-medium text-slate-700">
              {KEY_LIFTS[key]} (kg)
              <input
                type="number"
                min="1"
                step="0.5"
                value={draft[key] ?? ''}
                onChange={(event) => updateValue(key, event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          ))}

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
