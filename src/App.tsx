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
  const stored = getSelectedUser(users[0]);
  return users.includes(stored) ? stored : users[0];
}

export default function App() {
  const availableWeeks = useMemo(() => routineData.weeks.map((item) => item.week), []);
  const suggestedWeek = useMemo(
    () => getSuggestedWeek(PLAN_START_DATE, availableWeeks.length),
    [availableWeeks.length]
  );

  const [selectedUserName, setSelectedUserName] = useState<string>(() => resolveInitialUser(USERS));
  const [userState, setUserState] = useState<UserState>(() => getUserState(resolveInitialUser(USERS), suggestedWeek));

  useEffect(() => {
    setSelectedUser(selectedUserName);
    setUserState(getUserState(selectedUserName, suggestedWeek));
  }, [selectedUserName, suggestedWeek]);

  function persistUserState(next: UserState) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100">
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl bg-brand-900 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-100">GymPlex</p>
          <h1 className="mt-2 text-2xl font-bold">Planificador de rutina semanal</h1>
          <p className="mt-2 text-sm text-brand-100">
            Estructura simple para 5 usuarios, sin login, con cálculo automático por RM y porcentaje.
          </p>
        </header>

        <UserSelector users={USERS} selectedUser={selectedUserName} onChange={setSelectedUserName} />

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
