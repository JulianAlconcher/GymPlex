import { useEffect, useMemo, useState } from 'react';

import { OnboardingForm } from './components/OnboardingForm';
import { RmEditor } from './components/RmEditor';
import { RoutineWeekView } from './components/RoutineWeekView';
import { UserSelector } from './components/UserSelector';
import { WeekSelector } from './components/WeekSelector';
import { PLAN_START_DATE, routineData } from './data/routineData';
import { USERS } from './data/users';
import { getSelectedUser, getUserState, saveUserState, setSelectedUser } from './lib/storage';
import { getSuggestedWeek } from './lib/week';
import type { RmKey, UserState } from './types/routine';

function resolveInitialUser(users: string[]): string {
  const stored = getSelectedUser('');
  return users.includes(stored) ? stored : '';
}

export default function App() {
  const availableWeeks = useMemo(() => routineData.weeks.map((item) => item.week), []);
  const suggestedWeek = useMemo(
    () => getSuggestedWeek(PLAN_START_DATE, availableWeeks.length),
    [availableWeeks.length]
  );

  const [selectedUserName, setSelectedUserName] = useState<string>(() => resolveInitialUser(USERS));
  const [hasConfirmedUser, setHasConfirmedUser] = useState(false);
  const [userState, setUserState] = useState<UserState>(() => getUserState(USERS[0], suggestedWeek));

  useEffect(() => {
    if (!hasConfirmedUser || !selectedUserName) {
      return;
    }

    setSelectedUser(selectedUserName);
    setUserState(getUserState(selectedUserName, suggestedWeek));
  }, [hasConfirmedUser, selectedUserName, suggestedWeek]);

  function persistUserState(next: UserState) {
    if (!selectedUserName) {
      return;
    }

    setUserState(next);
    saveUserState(selectedUserName, next);
  }

  function handleOnboardingSave(rms: Partial<Record<RmKey, number>>) {
    persistUserState({
      ...userState,
      rms,
      onboardingCompleted: true,
      selectedWeek: userState.selectedWeek || suggestedWeek,
    });
  }

  function handleWeekChange(week: number) {
    persistUserState({
      ...userState,
      selectedWeek: week,
    });
  }

  function handleRmsUpdate(rms: Partial<Record<RmKey, number>>) {
    persistUserState({
      ...userState,
      rms,
      onboardingCompleted: true,
    });
  }

  const selectedWeek = userState.selectedWeek || suggestedWeek;
  const selectedWeekData = routineData.weeks.find((week) => week.week === selectedWeek) ?? routineData.weeks[0];

  if (!hasConfirmedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Seleccioná tu usuario</h1>
            <p className="text-sm text-slate-600">Antes de ver la rutina, elegí quién está usando la app.</p>
            <UserSelector users={USERS} selectedUser={selectedUserName} onChange={setSelectedUserName} />
            <button
              type="button"
              disabled={!selectedUserName}
              onClick={() => setHasConfirmedUser(true)}
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Entrar
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100">
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <UserSelector users={USERS} selectedUser={selectedUserName} onChange={setSelectedUserName} />

        <header className="rounded-2xl bg-brand-900 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-100">GymPlex</p>
          <h1 className="mt-2 text-2xl font-bold">Planificador de rutina semanal</h1>
          <p className="mt-2 text-sm text-brand-100">
            Estructura simple para 5 usuarios, sin login, con cálculo automático por RM y porcentaje.
          </p>
        </header>

        {!userState.onboardingCompleted ? (
          <OnboardingForm initialRms={userState.rms} onSave={handleOnboardingSave} />
        ) : (
          <>
            <WeekSelector
              availableWeeks={availableWeeks}
              selectedWeek={selectedWeekData.week}
              suggestedWeek={suggestedWeek}
              onChange={handleWeekChange}
              onUseSuggested={() => handleWeekChange(suggestedWeek)}
            />

            <RmEditor rms={userState.rms} onSave={handleRmsUpdate} />

            <RoutineWeekView week={selectedWeekData} rms={userState.rms} />
          </>
        )}
      </main>
    </div>
  );
}
