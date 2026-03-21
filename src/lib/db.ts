import { routineData } from '../data/routineData';
import { USERS } from '../data/users';
import { getUserState as getLocalUserState, saveUserState as saveLocalUserState } from './storage';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { AppUser, RmKey, TrainingDay, TrainingWeek, UserState } from '../types/routine';

type DbUserRow = {
  id: string;
  full_name: string;
  is_admin: boolean;
};

type DbRoutineWeekRow = {
  week_number: number;
  days: unknown;
};

type DbUserStateRow = {
  selected_week: number;
  rms: unknown;
  onboarding_completed: boolean;
};

function toLocalUsers(): AppUser[] {
  return USERS.map((fullName) => ({
    id: fullName,
    fullName,
    isAdmin: false,
  }));
}

function normalizeRms(value: unknown): Partial<Record<RmKey, number>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const rms = value as Record<string, unknown>;
  const parsed: Partial<Record<RmKey, number>> = {};

  const keys: RmKey[] = ['bench', 'squat', 'deadlift', 'pressMilitar', 'pressBanca', 'sentadilla', 'pesoMuerto'];

  keys.forEach((key) => {
    const candidate = rms[key];
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      parsed[key] = candidate;
    }
  });

  return {
    ...parsed,
    squat: parsed.squat ?? parsed.sentadilla,
    bench: parsed.bench ?? parsed.pressBanca,
    deadlift: parsed.deadlift ?? parsed.pesoMuerto,
  };
}

function normalizeDays(value: unknown): TrainingDay[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const rawDay = item as Record<string, unknown>;
      const exercises = Array.isArray(rawDay.exercises) ? rawDay.exercises : [];

      return {
        day: typeof rawDay.day === 'string' ? rawDay.day : 'DIA',
        exercises: exercises
          .filter((exercise) => exercise && typeof exercise === 'object')
          .map((exercise) => {
            const rawExercise = exercise as Record<string, unknown>;
            const supersetExercises = Array.isArray(rawExercise.supersetExercises)
              ? rawExercise.supersetExercises.filter((entry) => typeof entry === 'string')
              : undefined;

            return {
              name: typeof rawExercise.name === 'string' ? rawExercise.name : 'Ejercicio',
              sets:
                typeof rawExercise.sets === 'string' || typeof rawExercise.sets === 'number'
                  ? rawExercise.sets
                  : '-',
              reps:
                typeof rawExercise.reps === 'string' || typeof rawExercise.reps === 'number'
                  ? rawExercise.reps
                  : '-',
              notes: typeof rawExercise.notes === 'string' ? rawExercise.notes : undefined,
              percentage: typeof rawExercise.percentage === 'number' ? rawExercise.percentage : undefined,
              rmKey: typeof rawExercise.rmKey === 'string' ? (rawExercise.rmKey as RmKey) : undefined,
              isSuperset: Boolean(rawExercise.isSuperset),
              supersetExercises,
            };
          }),
      };
    });
}

export async function fetchUsers(): Promise<AppUser[]> {
  if (!isSupabaseConfigured || !supabase) {
    return toLocalUsers();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, is_admin')
    .order('full_name', { ascending: true });

  if (error) throw new Error(error.message);

  return (data as DbUserRow[]).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    isAdmin: row.is_admin,
  }));
}

export async function createUser(fullName: string): Promise<AppUser> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ full_name: fullName, is_admin: false })
    .select('id, full_name, is_admin')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el usuario.');

  return {
    id: data.id,
    fullName: data.full_name,
    isAdmin: data.is_admin,
  };
}

export async function updateUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function fetchRoutineWeeks(): Promise<TrainingWeek[]> {
  if (!isSupabaseConfigured || !supabase) {
    return routineData.weeks;
  }

  const { data, error } = await supabase
    .from('routine_weeks')
    .select('week_number, days')
    .order('week_number', { ascending: true });

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return [];
  }

  return (data as DbRoutineWeekRow[]).map((row) => ({
    week: row.week_number,
    days: normalizeDays(row.days),
  }));
}

export async function upsertRoutineWeek(weekNumber: number, days: TrainingDay[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.from('routine_weeks').upsert(
    {
      week_number: weekNumber,
      days,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'week_number' }
  );

  if (error) throw new Error(error.message);
}

export async function seedRoutineWeeksFromLocalData(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const payload = routineData.weeks.map((week) => ({
    week_number: week.week,
    days: week.days,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('routine_weeks').upsert(payload, { onConflict: 'week_number' });
  if (error) throw new Error(error.message);
}

export async function fetchUserState(userId: string, fallbackWeek: number): Promise<UserState> {
  if (!userId) {
    return {
      selectedWeek: fallbackWeek,
      rms: {},
      onboardingCompleted: false,
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return getLocalUserState(userId, fallbackWeek);
  }

  const { data, error } = await supabase
    .from('user_states')
    .select('selected_week, rms, onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return {
      selectedWeek: fallbackWeek,
      rms: {},
      onboardingCompleted: false,
    };
  }

  const row = data as DbUserStateRow;

  return {
    selectedWeek: row.selected_week || fallbackWeek,
    rms: normalizeRms(row.rms),
    onboardingCompleted: Boolean(row.onboarding_completed),
  };
}

export async function saveUserState(userId: string, userState: UserState): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    saveLocalUserState(userId, userState);
    return;
  }

  const { error } = await supabase.from('user_states').upsert(
    {
      user_id: userId,
      selected_week: userState.selectedWeek,
      rms: userState.rms,
      onboarding_completed: userState.onboardingCompleted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw new Error(error.message);
}
