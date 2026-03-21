import { useEffect, useState } from 'react';
import { KEY_LIFTS } from '../data/keyLifts';
import { calculatePercentageLoad, formatKg } from '../lib/calculations';
import type { Exercise, RmKey, TrainingWeek } from '../types/routine';

type RoutineWeekViewProps = {
  week: TrainingWeek;
  rms: Partial<Record<RmKey, number>>;
  completedDays: string[];
  completionTarget: number;
  completedCount: number;
  onToggleDayCompleted: (dayName: string) => void;
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
    hasPercentage && typeof rmValue === 'number' ? calculatePercentageLoad(rmValue, exercise.percentage as number) : undefined;

  return (
    <li className="flex flex-col gap-2 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-highest last:border-b-0 border-l-2 border-transparent hover:border-outline-variant transition-colors">
      <div className="flex-1">
        {exercise.isSuperset ? (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-widest text-primary mb-1">BI-SERIE</p>
            <div className="flex flex-col gap-1">
              {exercise.supersetExercises?.map((ex, idx) => (
                <p key={idx} className="font-display text-lg font-bold uppercase tracking-tight text-on-surface">• {ex}</p>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-display text-lg font-bold uppercase tracking-tight text-on-surface">{exercise.name}</p>
        )}
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface/60 mt-1">
          {exercise.sets} SETS × {exercise.reps} REPS
          {exercise.notes ? ` // ${exercise.notes}` : ''}
        </p>
      </div>

      {hasPercentage ? (
        rmValue ? (
          <div className="flex flex-col sm:items-end">
             <p className="font-display text-2xl font-bold text-primary">
              {formatKg(calculatedWeight ?? 0)}
            </p>
            <p className="font-body text-xs uppercase tracking-widest text-on-surface/50">
              {exercise.percentage}% {KEY_LIFTS[exerciseRmKey]}
            </p>
          </div>
        ) : (
          <p className="border border-outline-variant px-2 py-1 font-body text-[10px] uppercase text-outline-variant">
            Sin datos RM
          </p>
        )
      ) : (
        <p className="font-display text-lg font-bold text-on-surface/40 uppercase">Libre</p>
      )}
    </li>
  );
}

export function RoutineWeekView({
  week,
  rms,
  completedDays,
  completionTarget,
  completedCount,
  onToggleDayCompleted,
}: RoutineWeekViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    if (selectedDayIndex >= week.days.length) {
      setSelectedDayIndex(0);
    }
  }, [week, selectedDayIndex]);

  const activeDay = week.days[selectedDayIndex] || week.days[0];
  const isActiveDayCompleted = activeDay ? completedDays.includes(activeDay.day) : false;

  if (!activeDay) {
    return (
      <section className="space-y-6">
        <header className="border-l-2 border-primary pl-4">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-on-surface">
            / PROTOCOLO SEMANA {week.week}
          </h2>
          <p className="mt-1 font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60">
            PROGRESO {completedCount}/{completionTarget || 0} DIAS COMPLETADOS
          </p>
        </header>
        <article className="bg-surface-low p-6 shadow-xl">
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-on-surface/60">
            Esta semana no tiene días cargados todavía.
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="border-l-2 border-primary pl-4">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-on-surface">
          / PROTOCOLO SEMANA {week.week}
        </h2>
        <p className="mt-1 font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60">
          PROGRESO {completedCount}/{completionTarget || 0} DIAS COMPLETADOS
        </p>
      </header>

      <div className="flex overflow-x-auto gap-2 pb-2">
        {week.days.map((day, idx) => {
          const isActive = idx === selectedDayIndex;
          return (
            <button
              key={day.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`whitespace-nowrap px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                isActive 
                  ? 'bg-surface-highest text-primary border-primary' 
                  : 'bg-surface-low text-on-surface/50 border-transparent hover:text-on-surface hover:bg-surface-highest'
              }`}
            >
              {day.day}
            </button>
          );
        })}
      </div>

      <article className="bg-surface-low shadow-xl flex flex-col min-h-fit">
        <header className="bg-surface-highest p-4 border-b border-surface-highest flex justify-between items-center">
          <div>
            <h3 className="font-display text-xl font-bold text-primary uppercase tracking-tighter">{activeDay.day}</h3>
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/40">
              {activeDay.exercises.length} BLOQUES
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleDayCompleted(activeDay.day)}
            className={`border px-3 py-2 font-display text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              isActiveDayCompleted
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-outline-variant text-on-surface/70 hover:bg-surface'
            }`}
          >
            {isActiveDayCompleted ? 'Dia completado' : 'Marcar completado'}
          </button>
        </header>
        <ul className="flex flex-col bg-surface flex-grow">
          {activeDay.exercises.map((exercise, idx) => (
            <ExerciseRow key={`${activeDay.day}-${exercise.name}-${idx}`} exercise={exercise} rms={rms} />
          ))}
        </ul>
      </article>
    </section>
  );
}
