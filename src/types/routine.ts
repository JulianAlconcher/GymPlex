export type RmKey =
  | 'bench'
  | 'squat'
  | 'deadlift'
  | 'pressMilitar'
  | 'pressBanca'
  | 'sentadilla'
  | 'pesoMuerto';

export type Exercise = {
  name: string;
  sets: number | string;
  reps: number | string;
  notes?: string;
  percentage?: number;
  rmKey?: RmKey;
  isSuperset?: boolean;
  supersetExercises?: string[];
};

export type TrainingDay = {
  day: string;
  exercises: Exercise[];
};

export type TrainingWeek = {
  week: number;
  days: TrainingDay[];
};

export type RoutineData = {
  weeks: TrainingWeek[];
};

export type UserState = {
  selectedWeek: number;
  rms: Partial<Record<RmKey, number>>;
  onboardingCompleted: boolean;
};

export type StoredAppState = Record<string, UserState>;

export type AppUser = {
  id: string;
  fullName: string;
  isAdmin: boolean;
};
