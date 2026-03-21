import { useEffect, useMemo, useState } from 'react';

import type { AppUser, Exercise, RmKey, TrainingDay, TrainingWeek } from '../types/routine';

type AdminPanelProps = {
  users: AppUser[];
  routineWeeks: TrainingWeek[];
  onCreateUser: (fullName: string) => Promise<void>;
  onToggleAdmin: (userId: string, nextIsAdmin: boolean) => Promise<void>;
  onSaveRoutineWeek: (weekNumber: number, days: TrainingDay[]) => Promise<void>;
  onSeedRoutine: () => Promise<void>;
};

const RM_KEY_OPTIONS: Array<{ label: string; value: '' | RmKey }> = [
  { label: 'Sin RM', value: '' },
  { label: 'Bench', value: 'bench' },
  { label: 'Squat', value: 'squat' },
  { label: 'Deadlift', value: 'deadlift' },
  { label: 'Press Militar', value: 'pressMilitar' },
  { label: 'Press Banca', value: 'pressBanca' },
  { label: 'Sentadilla', value: 'sentadilla' },
  { label: 'Peso Muerto', value: 'pesoMuerto' },
];

function cloneDays(days: TrainingDay[]): TrainingDay[] {
  return days.map((day) => ({
    day: day.day,
    exercises: day.exercises.map((exercise) => ({
      ...exercise,
      supersetExercises: exercise.supersetExercises ? [...exercise.supersetExercises] : undefined,
    })),
  }));
}

function buildNewExercise(): Exercise {
  return {
    name: 'Nuevo ejercicio',
    sets: '3',
    reps: '8-12',
  };
}

export function AdminPanel({
  users,
  routineWeeks,
  onCreateUser,
  onToggleAdmin,
  onSaveRoutineWeek,
  onSeedRoutine,
}: AdminPanelProps) {
  const [newUserName, setNewUserName] = useState('');
  const [weekInput, setWeekInput] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [draftDays, setDraftDays] = useState<TrainingDay[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [okMessage, setOkMessage] = useState('');

  const availableWeeks = useMemo(() => routineWeeks.map((week) => week.week), [routineWeeks]);
  const activeDay = draftDays[selectedDayIndex] ?? null;

  useEffect(() => {
    if (availableWeeks.length === 0) {
      setSelectedWeek(1);
      setWeekInput(1);
      setDraftDays([]);
      setSelectedDayIndex(0);
      return;
    }

    if (!availableWeeks.includes(selectedWeek)) {
      const first = availableWeeks[0];
      setSelectedWeek(first);
      setWeekInput(first);
      return;
    }

    const targetWeek = routineWeeks.find((week) => week.week === selectedWeek);
    const nextDays = cloneDays(targetWeek?.days ?? []);
    setDraftDays(nextDays);
    setSelectedDayIndex((prev) => (prev >= nextDays.length ? 0 : prev));
  }, [availableWeeks, routineWeeks, selectedWeek]);

  async function handleCreateUser() {
    const trimmed = newUserName.trim();
    if (!trimmed) {
      setError('Ingresá un nombre válido.');
      return;
    }

    setError('');
    setOkMessage('');
    setIsSubmitting(true);

    try {
      await onCreateUser(trimmed);
      setNewUserName('');
      setOkMessage('Usuario creado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveWeek() {
    setError('');
    setOkMessage('');

    if (weekInput < 1 || !Number.isFinite(weekInput)) {
      setError('La semana debe ser un número mayor a 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSaveRoutineWeek(weekInput, cloneDays(draftDays));
      setSelectedWeek(weekInput);
      setOkMessage(`Semana ${weekInput} guardada.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la rutina.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSeedRoutine() {
    setError('');
    setOkMessage('');
    setIsSubmitting(true);

    try {
      await onSeedRoutine();
      setOkMessage('Rutina base importada a Supabase.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar la rutina.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAdminRole(userId: string, nextIsAdmin: boolean) {
    setError('');
    setOkMessage('');
    setIsSubmitting(true);

    try {
      await onToggleAdmin(userId, nextIsAdmin);
      setOkMessage('Rol de usuario actualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateDayName(index: number, value: string) {
    setDraftDays((prev) => prev.map((day, idx) => (idx === index ? { ...day, day: value } : day)));
  }

  function addDay() {
    setDraftDays((prev) => {
      const next = [...prev, { day: `Día ${prev.length + 1}`, exercises: [] }];
      setSelectedDayIndex(next.length - 1);
      return next;
    });
  }

  function removeDay(index: number) {
    setDraftDays((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      setSelectedDayIndex((current) => {
        if (next.length === 0) return 0;
        if (current > index) return current - 1;
        if (current === index) return Math.max(0, current - 1);
        return current;
      });
      return next;
    });
  }

  function addExercise(dayIndex: number) {
    setDraftDays((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              exercises: [...day.exercises, buildNewExercise()],
            }
          : day
      )
    );
  }

  function removeExercise(dayIndex: number, exerciseIndex: number) {
    setDraftDays((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((_, exIdx) => exIdx !== exerciseIndex),
            }
          : day
      )
    );
  }

  function updateExercise(dayIndex: number, exerciseIndex: number, patch: Partial<Exercise>) {
    setDraftDays((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((exercise, exIdx) =>
                exIdx === exerciseIndex
                  ? {
                      ...exercise,
                      ...patch,
                    }
                  : exercise
              ),
            }
          : day
      )
    );
  }

  return (
    <section className="space-y-6 border-l-4 border-primary bg-surface-low p-6 shadow-xl">
      <header>
        <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-on-surface">Panel Admin</h2>
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60">
          Gestioná usuarios y rutina en Supabase.
        </p>
      </header>

      {error ? (
        <p className="border border-error/30 bg-error/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-error">
          {error}
        </p>
      ) : null}

      {okMessage ? (
        <p className="border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
          {okMessage}
        </p>
      ) : null}

      <div className="space-y-3 border border-outline-variant p-4">
        <p className="font-display text-sm font-bold uppercase tracking-wider text-on-surface">Usuarios</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newUserName}
            onChange={(event) => setNewUserName(event.target.value)}
            className="w-full border-b-2 border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
            placeholder="Nombre completo"
          />
          <button
            type="button"
            onClick={handleCreateUser}
            disabled={isSubmitting}
            className="border border-primary px-4 py-3 font-display text-xs uppercase tracking-wider text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            Crear usuario
          </button>
        </div>

        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between border border-outline-variant p-3">
              <div>
                <p className="font-display text-sm uppercase tracking-wide text-on-surface">{user.fullName}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface/50">
                  {user.isAdmin ? 'ADMIN' : 'USUARIO'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleToggleAdminRole(user.id, !user.isAdmin);
                }}
                disabled={isSubmitting}
                className="border border-outline-variant px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {user.isAdmin ? 'Quitar admin' : 'Hacer admin'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 border border-outline-variant p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-on-surface">Rutinas</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs uppercase tracking-widest text-on-surface/60">
              Semana
              <input
                type="number"
                min={1}
                step={1}
                value={weekInput}
                onChange={(event) => setWeekInput(Number(event.target.value))}
                className="mt-1 w-24 border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveWeek}
              disabled={isSubmitting}
              className="border border-primary px-4 py-3 font-display text-xs uppercase tracking-wider text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              Guardar semana
            </button>
            <button
              type="button"
              onClick={handleSeedRoutine}
              disabled={isSubmitting}
              className="border border-outline-variant px-4 py-3 font-display text-xs uppercase tracking-wider text-on-surface hover:border-primary disabled:opacity-50"
            >
              Importar rutina base
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableWeeks.map((week) => (
            <button
              key={week}
              type="button"
              onClick={() => {
                setSelectedWeek(week);
                setWeekInput(week);
              }}
              className={`border px-3 py-2 text-[10px] font-semibold uppercase tracking-widest ${
                selectedWeek === week
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant text-on-surface/70 hover:border-primary'
              }`}
            >
              Semana {week}
            </button>
          ))}
        </div>

        <div className="space-y-3 border border-outline-variant p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface/60">Días</p>
            <button
              type="button"
              onClick={addDay}
              className="border border-outline-variant px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface hover:border-primary"
            >
              Agregar día
            </button>
          </div>

          {draftDays.length === 0 ? (
            <p className="text-xs uppercase tracking-widest text-on-surface/50">No hay días en esta semana.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {draftDays.map((day, idx) => (
                <button
                  key={`${day.day}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`border px-3 py-2 text-[10px] font-semibold uppercase tracking-widest ${
                    idx === selectedDayIndex
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface/70 hover:border-primary'
                  }`}
                >
                  {day.day || `Día ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {activeDay ? (
            <div className="space-y-3 border border-outline-variant p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="block flex-1 text-xs uppercase tracking-widest text-on-surface/60">
                  Nombre del día
                  <input
                    type="text"
                    value={activeDay.day}
                    onChange={(event) => updateDayName(selectedDayIndex, event.target.value)}
                    className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeDay(selectedDayIndex)}
                  className="border border-error/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-error hover:bg-error/10"
                >
                  Eliminar día
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface/60">Ejercicios</p>
                <button
                  type="button"
                  onClick={() => addExercise(selectedDayIndex)}
                  className="border border-outline-variant px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface hover:border-primary"
                >
                  Agregar ejercicio
                </button>
              </div>

              {activeDay.exercises.length === 0 ? (
                <p className="text-xs uppercase tracking-widest text-on-surface/50">No hay ejercicios en este día.</p>
              ) : (
                <div className="space-y-3">
                  {activeDay.exercises.map((exercise, exerciseIndex) => (
                    <article key={`${exercise.name}-${exerciseIndex}`} className="space-y-3 border border-outline-variant p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          Nombre
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                name: event.target.value,
                              })
                            }
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </label>

                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          RM base
                          <select
                            value={exercise.rmKey ?? ''}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                rmKey: (event.target.value as RmKey) || undefined,
                              })
                            }
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          >
                            {RM_KEY_OPTIONS.map((option) => (
                              <option key={option.label} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          Sets
                          <input
                            type="text"
                            value={String(exercise.sets)}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                sets: event.target.value,
                              })
                            }
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </label>

                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          Reps
                          <input
                            type="text"
                            value={String(exercise.reps)}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                reps: event.target.value,
                              })
                            }
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </label>

                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          % (opcional)
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={exercise.percentage ?? ''}
                            onChange={(event) => {
                              const raw = Number(event.target.value);
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                percentage: Number.isFinite(raw) && raw > 0 ? raw : undefined,
                              });
                            }}
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </label>

                        <label className="text-xs uppercase tracking-widest text-on-surface/60">
                          Notas
                          <input
                            type="text"
                            value={exercise.notes ?? ''}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                notes: event.target.value || undefined,
                              })
                            }
                            className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                          />
                        </label>
                      </div>

                      <div className="space-y-2 border border-outline-variant p-3">
                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface/60">
                          <input
                            type="checkbox"
                            checked={Boolean(exercise.isSuperset)}
                            onChange={(event) =>
                              updateExercise(selectedDayIndex, exerciseIndex, {
                                isSuperset: event.target.checked,
                                supersetExercises: event.target.checked
                                  ? exercise.supersetExercises ?? []
                                  : undefined,
                              })
                            }
                          />
                          Es bi-serie
                        </label>

                        {exercise.isSuperset ? (
                          <label className="text-xs uppercase tracking-widest text-on-surface/60">
                            Ejercicios de bi-serie (separados por coma)
                            <input
                              type="text"
                              value={(exercise.supersetExercises ?? []).join(', ')}
                              onChange={(event) => {
                                const values = event.target.value
                                  .split(',')
                                  .map((entry) => entry.trim())
                                  .filter(Boolean);

                                updateExercise(selectedDayIndex, exerciseIndex, {
                                  supersetExercises: values,
                                });
                              }}
                              className="mt-1 w-full border-b-2 border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                            />
                          </label>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeExercise(selectedDayIndex, exerciseIndex)}
                        className="border border-error/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-error hover:bg-error/10"
                      >
                        Eliminar ejercicio
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
