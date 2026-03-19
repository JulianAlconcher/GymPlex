import { KEY_LIFTS } from '../data/keyLifts';
import { calculatePercentageLoad, formatKg } from '../lib/calculations';
import type { Exercise, RmKey, TrainingWeek } from '../types/routine';

type RoutineWeekViewProps = {
  week: TrainingWeek;
  rms: Partial<Record<RmKey, number>>;
};

function getRmValueForKey(rms: Partial<Record<RmKey, number>>, key: RmKey): number | undefined {
  const aliasMap: Partial<Record<RmKey, RmKey[]>> = {
    bench: ['pressBanca'],
    squat: ['sentadilla'],
    deadlift: ['pesoMuerto'],
    pressBanca: ['bench'],
    sentadilla: ['squat'],
    pesoMuerto: ['deadlift'],
    pressMilitar: ['bench', 'pressBanca'],
  };

  const keysToTry = [key, ...(aliasMap[key] ?? [])];
  for (const candidate of keysToTry) {
    const value = rms[candidate];
    if (typeof value === 'number' && value > 0) {
      return value;
    }
  }

  return undefined;
}

function ExerciseRow({ exercise, rms }: { exercise: Exercise; rms: Partial<Record<RmKey, number>> }) {
  const exerciseRmKey = exercise.rmKey;
  const hasPercentage = typeof exercise.percentage === 'number' && typeof exerciseRmKey === 'string';
  const rmValue = hasPercentage ? getRmValueForKey(rms, exerciseRmKey) : undefined;
  const calculatedWeight =
    hasPercentage && typeof rmValue === 'number' ? calculatePercentageLoad(rmValue, exercise.percentage) : undefined;

  return (
    <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{exercise.name}</p>
          <p className="text-xs text-slate-600">
            {exercise.sets} series x {exercise.reps} reps
            {exercise.notes ? ` (${exercise.notes})` : ''}
          </p>
        </div>

        {hasPercentage ? (
          rmValue ? (
            <p className="text-sm font-semibold text-brand-900">
              {exercise.percentage}% de {KEY_LIFTS[exerciseRmKey]}: {formatKg(calculatedWeight ?? 0)}
            </p>
          ) : (
            <p className="text-xs font-medium text-amber-700">
              Definí RM de {KEY_LIFTS[exerciseRmKey]} para calcular el peso.
            </p>
          )
        ) : (
          <p className="text-xs font-medium text-slate-500">Carga libre</p>
        )}
      </div>
    </li>
  );
}

export function RoutineWeekView({ week, rms }: RoutineWeekViewProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Semana {week.week}</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {week.days.map((day) => (
          <article key={day.day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{day.day}</h3>
            <ul className="mt-3 space-y-2">
              {day.exercises.map((exercise) => (
                <ExerciseRow key={`${day.day}-${exercise.name}`} exercise={exercise} rms={rms} />
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
