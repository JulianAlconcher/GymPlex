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
    <section className="bg-surface-low shadow-xl">
      <div className="flex flex-col gap-4 border-l-2 border-primary bg-surface-highest p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tighter text-on-surface">CALIBRACIÓN RM</h2>
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60">EDITAR MÁXIMO PESO (1 REP)</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="border border-outline-variant px-6 py-3 font-display uppercase tracking-wider text-on-surface transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
        >
          {isOpen ? 'CERRAR PANEL' : 'ABRIR CALIBRADOR'}
        </button>
      </div>

      {isOpen && (
        <form className="grid gap-6 p-6 sm:grid-cols-2" onSubmit={handleSave}>
          {EDITABLE_RM_KEYS.map((key) => (
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
                className="w-full border-b-2 border-outline-variant bg-surface px-4 py-3 font-display text-xl text-on-surface outline-none transition-colors focus:border-primary focus:bg-surface-highest"
                placeholder="--.-"
              />
            </label>
          ))}

          <div className="sm:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-br from-primary-container to-inverse-primary px-6 py-4 font-display text-base uppercase tracking-wider text-white transition-all hover:brightness-110 sm:w-auto"
            >
              CONFIRMAR DATOS
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
