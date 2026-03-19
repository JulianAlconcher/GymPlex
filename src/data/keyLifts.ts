import type { RmKey } from '../types/routine';

export const KEY_LIFTS: Record<RmKey, string> = {
  bench: 'Press banca',
  squat: 'Sentadilla',
  deadlift: 'Dead lift',
  pressMilitar: 'Press militar',
  pressBanca: 'Press banca',
  sentadilla: 'Sentadilla',
  pesoMuerto: 'Dead lift',
};

export const ONBOARDING_RM_KEYS: RmKey[] = ['squat', 'bench', 'deadlift'];
export const EDITABLE_RM_KEYS: RmKey[] = ['squat', 'bench', 'deadlift'];
