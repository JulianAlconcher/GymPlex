import type { StoredAppState, UserState } from '../types/routine';

const SELECTED_USER_KEY = 'gymplex.selectedUser';
const APP_STATE_KEY = 'gymplex.appState.v1';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSelectedUser(defaultUser: string): string {
  return localStorage.getItem(SELECTED_USER_KEY) ?? defaultUser;
}

export function setSelectedUser(user: string): void {
  localStorage.setItem(SELECTED_USER_KEY, user);
}

export function getAllUserState(): StoredAppState {
  return safeParse<StoredAppState>(localStorage.getItem(APP_STATE_KEY), {});
}

export function getUserState(user: string, fallbackWeek: number): UserState {
  const allState = getAllUserState();
  const state = allState[user];

  if (!state) {
    return {
      selectedWeek: fallbackWeek,
      rms: {},
      onboardingCompleted: false,
      completedDaysByWeek: {},
    };
  }

  const migratedRms = {
    ...state.rms,
    squat: state.rms.squat ?? state.rms.sentadilla,
    bench: state.rms.bench ?? state.rms.pressBanca,
    deadlift: state.rms.deadlift ?? state.rms.pesoMuerto,
  };

  return (
    {
      ...state,
      selectedWeek: state.selectedWeek || fallbackWeek,
      rms: migratedRms,
      onboardingCompleted: state.onboardingCompleted || false,
      completedDaysByWeek:
        state.completedDaysByWeek && typeof state.completedDaysByWeek === 'object' ? state.completedDaysByWeek : {},
    }
  );
}

export function saveUserState(user: string, userState: UserState): void {
  const current = getAllUserState();
  const next: StoredAppState = {
    ...current,
    [user]: userState,
  };

  localStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
}
