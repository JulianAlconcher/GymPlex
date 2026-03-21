import type { RmKey } from '../types/routine';

export const KEY_LIFTS: Record<RmKey, string> = {
  bench: 'Bench Press',
  squat: 'Squat',
  deadlift: 'Deadlift',
  pressMilitar: 'Overhead Press',
  pressBanca: 'Bench Press',
  sentadilla: 'Squat',
  pesoMuerto: 'Deadlift',
};

export const ONBOARDING_RM_KEYS: RmKey[] = ['squat', 'bench', 'deadlift'];
export const EDITABLE_RM_KEYS: RmKey[] = ['squat', 'bench', 'deadlift'];
