import { useEffect, useMemo, useState } from 'react';

import { OnboardingForm } from './components/OnboardingForm';
import { Preloader } from './components/Preloader';
import { RmEditor } from './components/RmEditor';
import { RoutineWeekView } from './components/RoutineWeekView';
import { UserSelector } from './components/UserSelector';
import { WeekSelector } from './components/WeekSelector';
import { PLAN_START_DATE, routineData } from './data/routineData';
import { BottomNav, type TabId } from './components/BottomNav';
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
  const [hasPassedPreloader, setHasPassedPreloader] = useState(false);
  const [userState, setUserState] = useState<UserState>(() => getUserState(USERS[0], suggestedWeek));
  const [activeTab, setActiveTab] = useState<TabId>('routine');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

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

  if (!hasPassedPreloader) {
    return <Preloader onEnter={() => setHasPassedPreloader(true)} />;
  }

  if (!hasConfirmedUser) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="w-full space-y-6 bg-surface-low p-8 shadow-2xl">
            <div className="border-l-2 border-primary pl-4">
              <h1 className="font-display text-3xl font-bold uppercase tracking-tighter text-on-surface">ACCESO CORE</h1>
              <p className="mt-1 text-sm text-on-surface/60">SELECCIONÁ TU PERFIL PARA INICIAR LA MATRIZ DE CARGA</p>
            </div>
            <UserSelector users={USERS} selectedUser={selectedUserName} onChange={setSelectedUserName} />
            <button
              type="button"
              disabled={!selectedUserName}
              onClick={() => setHasConfirmedUser(true)}
              className="mt-6 w-full bg-gradient-to-br from-primary-container to-inverse-primary px-6 py-4 font-display text-base uppercase tracking-tight text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-surface-highest disabled:from-surface-highest disabled:to-surface-highest disabled:text-on-surface/30"
            >
              Inicializar
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24 font-body text-on-surface">
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-l-[3px] border-primary bg-surface-low p-6 shadow-xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary">GYMPLEX</p>
          <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-tighter text-on-surface">
            {activeTab === 'routine' ? 'DATA TRACKER' : activeTab === 'calibrator' ? '1RM CALIBRATOR' : 'PERFIL DE USUARIO'}
          </h1>
        </header>

        {!userState.onboardingCompleted ? (
          <OnboardingForm initialRms={userState.rms} onSave={handleOnboardingSave} />
        ) : (
          <div className="space-y-8">
            {activeTab === 'profile' && (
              <section className="bg-surface-low p-6 shadow-xl">
                <UserSelector users={USERS} selectedUser={selectedUserName} onChange={setSelectedUserName} />
              </section>
            )}

            {activeTab === 'routine' && (
              <>
                <WeekSelector
                  availableWeeks={availableWeeks}
                  selectedWeek={selectedWeekData.week}
                  suggestedWeek={suggestedWeek}
                  onChange={handleWeekChange}
                  onUseSuggested={() => handleWeekChange(suggestedWeek)}
                />

                <RoutineWeekView 
                  week={{
                    ...selectedWeekData,
                    days: selectedUserName === 'Francisco Ruiz Gomez' ? selectedWeekData.days : selectedWeekData.days.slice(0, 4)
                  }} 
                  rms={userState.rms} 
                  selectedDayIndex={selectedDayIndex}
                  onChangeDayIndex={setSelectedDayIndex}
                />
              </>
            )}

            {activeTab === 'calibrator' && (
              <RmEditor rms={userState.rms} onSave={handleRmsUpdate} />
            )}

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}
      </main>
    </div>
  );
}
