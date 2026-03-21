import type { Exercise, RmKey, RoutineData, TrainingDay, TrainingWeek } from '../types/routine';
import rawData from './routine_data.json';

export const PLAN_START_DATE = '2026-03-16';

function matchRmKey(name: string): RmKey | undefined {
  const lower = name.toLowerCase();
  if (lower.includes('deadlift') && !lower.includes('romanian')) return 'deadlift';
  if (lower.includes('squat') && !lower.includes('split')) return 'squat';
  if (lower.includes('bench press') || lower.includes('bench volume')) return 'bench';
  return undefined;
}

function processDay(dayData: any, accessoriesInfo: any): TrainingDay {
  const exercises: Exercise[] = [];

  const accReps = accessoriesInfo?.reps || '10-15';
  const accRir = accessoriesInfo?.rir ? `RIR ${accessoriesInfo.rir}` : 'RIR 2-3';

  if (dayData.main) {
    exercises.push({
      name: dayData.main.name,
      sets: dayData.main.sets,
      reps: dayData.main.reps,
      percentage: dayData.main.percentage,
      rmKey: matchRmKey(dayData.main.name),
    });
  }

  if (Array.isArray(dayData.exercises)) {
    dayData.exercises.forEach((item: any) => {
      if (item.type === 'superset' && Array.isArray(item.exercises)) {
        const exNames = item.exercises.map((e: any) => e.name);
        exercises.push({
          name: `Bi-Serie: ${exNames.join(' + ')}`,
          sets: item.sets || 3,
          reps: accReps,
          notes: accRir,
          isSuperset: true,
          supersetExercises: exNames,
        });
      } else if (item.type === 'finisher') {
        exercises.push({
          name: `${item.name}`,
          sets: item.sets || 1,
          reps: item.duration || accReps,
          notes: 'Metabólico',
        });
      } else {
        exercises.push({
          name: item.name,
          sets: item.sets || 3,
          reps: item.reps || accReps,
          notes: accRir,
        });
      }
    });
  }

  return {
    day: dayData.day,
    exercises,
  };
}

function processProgram(program: any[]): RoutineData {
  const weeks: TrainingWeek[] = program.map((weekItem) => {
    if (weekItem.deload) {
      return {
        week: weekItem.week,
        days: [
          {
            day: 'DELOAD / DESCARGA',
            exercises: [
              {
                name: 'Entrenamiento de Descarga',
                sets: 'LIVIANO',
                reps: 'Actividad libre',
                notes: 'Cardio ligero o movilidad',
              },
            ],
          },
        ],
      };
    }

    return {
      week: weekItem.week,
      days: (weekItem.days || []).map((day: any) => processDay(day, weekItem.accessories)),
    };
  });

  return { weeks };
}

export const routineData: RoutineData = processProgram(rawData.program);
