import { useEffect, useMemo, useState } from 'react';

import { AdminPanel } from './components/AdminPanel';
import { OnboardingForm } from './components/OnboardingForm';
import { Preloader } from './components/Preloader';
import { RmEditor } from './components/RmEditor';
import { RoutineWeekView } from './components/RoutineWeekView';
import { UserSelector } from './components/UserSelector';
import { WeekSelector } from './components/WeekSelector';
import { BottomNav, type TabId } from './components/BottomNav';
import { PLAN_START_DATE } from './data/routineData';
import {
  createUser,
  fetchRoutineWeeks,
  fetchUserState,
  fetchUsers,
  saveUserState,
  seedRoutineWeeksFromLocalData,
  updateUserAdmin,
  upsertRoutineWeek,
} from './lib/db';
import { getSelectedUser, setSelectedUser } from './lib/storage';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { getSuggestedWeek } from './lib/week';
import type { AppUser, RmKey, TrainingDay, TrainingWeek, UserState } from './types/routine';

function resolveInitialUserId(users: AppUser[]): string {
  const stored = getSelectedUser('');
  return users.some((user) => user.id === stored) ? stored : '';
}

function sortUsers(users: AppUser[]): AppUser[] {
  return [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function upsertWeekList(weeks: TrainingWeek[], weekNumber: number, days: TrainingDay[]): TrainingWeek[] {
  const filtered = weeks.filter((week) => week.week !== weekNumber);
  return [...filtered, { week: weekNumber, days }].sort((a, b) => a.week - b.week);
}

function defaultUserState(): UserState {
  return {
    selectedWeek: 1,
    rms: {},
    onboardingCompleted: false,
    completedDaysByWeek: {},
  };
}

export default function App() {
  const [hasConfirmedUser, setHasConfirmedUser] = useState(false);
  const [hasPassedPreloader, setHasPassedPreloader] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [routineWeeks, setRoutineWeeks] = useState<TrainingWeek[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [userState, setUserState] = useState<UserState>({
    selectedWeek: 1,
    rms: {},
    onboardingCompleted: false,
    completedDaysByWeek: {},
  });

  const availableWeeks = useMemo(() => routineWeeks.map((item) => item.week), [routineWeeks]);
  const suggestedWeek = useMemo(
    () => getSuggestedWeek(PLAN_START_DATE, Math.max(availableWeeks.length, 1)),
    [availableWeeks.length]
  );

  const [activeTab, setActiveTab] = useState<TabId>('routine');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setIsBootstrapping(true);
      setErrorMessage('');

      try {
        const fetchedUsers = await fetchUsers();
        let fetchedWeeks = await fetchRoutineWeeks();

        if (isSupabaseConfigured && fetchedWeeks.length === 0) {
          await seedRoutineWeeksFromLocalData();
          fetchedWeeks = await fetchRoutineWeeks();
        }

        if (!mounted) return;

        const sortedUsers = sortUsers(fetchedUsers);
        const weeks = fetchedWeeks;

        setUsers(sortedUsers);
        setRoutineWeeks(weeks);

        const initialUserId = resolveInitialUserId(sortedUsers);
        setSelectedUserId(initialUserId);

        if (initialUserId) {
          const state = await fetchUserState(initialUserId, 1);
          if (!mounted) return;
          setUserState(state);
        } else {
          setUserState(defaultUserState());
        }
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los datos.');
      } finally {
        if (!mounted) return;
        setIsBootstrapping(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [suggestedWeek]);
  useEffect(() => {
    let mounted = true;

    async function loadUserState() {
      if (!hasConfirmedUser || !selectedUserId) {
        return;
      }

      setErrorMessage('');
      setSelectedUser(selectedUserId);

      try {
        const state = await fetchUserState(selectedUserId, 1);
        if (!mounted) return;
        setUserState(state);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar el estado del usuario.');
      }
    }

    loadUserState();

    return () => {
      mounted = false;
    };
  }, [hasConfirmedUser, selectedUserId, suggestedWeek]);

  useEffect(() => {
    setIsAdminPanelOpen(false);
  }, [selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  const selectedWeek = userState.selectedWeek || 1;
  const selectedWeekData =
    routineWeeks.find((week) => week.week === selectedWeek) ??
    routineWeeks[0] ?? {
      week: 1,
      days: [],
    };
  const visibleDays =
    selectedUser?.fullName === 'Francisco Ruiz Gomez' ? selectedWeekData.days : selectedWeekData.days.slice(0, 4);
  const completionTarget = Math.min(4, visibleDays.length);
  const currentWeekKey = String(selectedWeekData.week);
  const completedDaysForWeek = userState.completedDaysByWeek[currentWeekKey] ?? [];
  const completedVisibleDays = visibleDays.filter((day) => completedDaysForWeek.includes(day.day)).length;

  async function persistUserState(next: UserState) {
    if (!selectedUserId) {
      return;
    }

    setUserState(next);

    try {
      await saveUserState(selectedUserId, next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar el estado.');
    }
  }

  async function handleOnboardingSave(rms: Partial<Record<RmKey, number>>) {
    await persistUserState({
      ...userState,
      rms,
      onboardingCompleted: true,
      selectedWeek: userState.selectedWeek || 1,
    });
  }

  async function handleWeekChange(week: number) {
    await persistUserState({
      ...userState,
      selectedWeek: week,
    });
  }

  async function handleRmsUpdate(rms: Partial<Record<RmKey, number>>) {
    await persistUserState({
      ...userState,
      rms,
      onboardingCompleted: true,
    });
  }

  async function handleToggleDayCompleted(dayName: string) {
    const weekKey = String(selectedWeekData.week);
    const currentCompleted = userState.completedDaysByWeek[weekKey] ?? [];
    const isCurrentlyCompleted = currentCompleted.includes(dayName);
    const nextWeekCompleted = isCurrentlyCompleted
      ? currentCompleted.filter((entry) => entry !== dayName)
      : [...currentCompleted, dayName];

    let nextSelectedWeek = userState.selectedWeek || 1;
    if (!isCurrentlyCompleted && completionTarget > 0) {
      const visibleDayNames = new Set(visibleDays.map((day) => day.day));
      const completedVisibleCount = nextWeekCompleted.filter((entry) => visibleDayNames.has(entry)).length;

      if (completedVisibleCount >= completionTarget) {
        const nextWeek = availableWeeks.find((week) => week > selectedWeekData.week);
        if (typeof nextWeek === 'number') {
          nextSelectedWeek = nextWeek;
        }
      }
    }

    await persistUserState({
      ...userState,
      selectedWeek: nextSelectedWeek,
      completedDaysByWeek: {
        ...userState.completedDaysByWeek,
        [weekKey]: nextWeekCompleted,
      },
    });
  }

  async function handleCreateUser(fullName: string) {
    setIsBusy(true);
    setErrorMessage('');

    try {
      const created = await createUser(fullName);
      setUsers((prev) => sortUsers([...prev, created]));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el usuario.');
      throw error;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleToggleAdmin(userId: string, nextIsAdmin: boolean) {
    setIsBusy(true);
    setErrorMessage('');

    try {
      await updateUserAdmin(userId, nextIsAdmin);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isAdmin: nextIsAdmin } : user)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el rol.');
      throw error;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveRoutineWeek(weekNumber: number, days: TrainingDay[]) {
    setIsBusy(true);
    setErrorMessage('');

    try {
      await upsertRoutineWeek(weekNumber, days);
      setRoutineWeeks((prev) => upsertWeekList(prev, weekNumber, days));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la rutina.');
      throw error;
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSeedRoutine() {
    setIsBusy(true);
    setErrorMessage('');

    try {
      await seedRoutineWeeksFromLocalData();
      const refreshedWeeks = await fetchRoutineWeeks();
      setRoutineWeeks(refreshedWeeks);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo importar la rutina base.');
      throw error;
    } finally {
      setIsBusy(false);
    }
  }

  if (!hasPassedPreloader) {
    return <Preloader onEnter={() => setHasPassedPreloader(true)} />;
  }

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="w-full space-y-4 bg-surface-low p-8 shadow-2xl">
            <h1 className="font-display text-2xl font-bold uppercase tracking-tighter">Cargando datos...</h1>
            <p className="text-sm text-on-surface/60">Conectando con la base de datos.</p>
          </section>
        </main>
      </div>
    );
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

            {errorMessage ? (
              <p className="border border-error/40 bg-error/10 p-3 text-xs font-semibold uppercase tracking-wider text-error">
                {errorMessage}
              </p>
            ) : null}

            {!isSupabaseConfigured ? (
              <p className="border border-outline-variant bg-surface p-3 text-xs font-semibold uppercase tracking-wider text-on-surface/70">
                Supabase no está configurado. La app está funcionando en modo local.
              </p>
            ) : null}

            <UserSelector users={users} selectedUserId={selectedUserId} onChange={setSelectedUserId} />

            <button
              type="button"
              disabled={!selectedUserId}
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

        {errorMessage ? (
          <p className="border border-error/40 bg-error/10 p-3 text-xs font-semibold uppercase tracking-wider text-error">
            {errorMessage}
          </p>
        ) : null}

        {!userState.onboardingCompleted ? (
          <OnboardingForm initialRms={userState.rms} onSave={handleOnboardingSave} />
        ) : (
          <div className="space-y-8">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <section className="bg-surface-low p-6 shadow-xl">
                  <UserSelector users={users} selectedUserId={selectedUserId} onChange={setSelectedUserId} hideTitle />
                </section>

                {selectedUser?.isAdmin ? (
                  <section className="bg-surface-low p-6 shadow-xl">
                    <button
                      type="button"
                      onClick={() => setIsAdminPanelOpen((prev) => !prev)}
                      className="w-full border border-primary px-4 py-3 font-display text-xs uppercase tracking-wider text-primary hover:bg-primary/10"
                    >
                      {isAdminPanelOpen ? 'Cerrar Panel Admin' : 'Abrir Panel Admin'}
                    </button>
                  </section>
                ) : null}

                {selectedUser?.isAdmin && isAdminPanelOpen ? (
                  <AdminPanel
                    users={users}
                    routineWeeks={routineWeeks}
                    onCreateUser={handleCreateUser}
                    onToggleAdmin={handleToggleAdmin}
                    onSaveRoutineWeek={handleSaveRoutineWeek}
                    onSeedRoutine={handleSeedRoutine}
                  />
                ) : null}
              </div>
            )}

            {activeTab === 'routine' && (
              <>
                <WeekSelector
                  availableWeeks={availableWeeks}
                  selectedWeek={selectedWeekData.week}
                  suggestedWeek={suggestedWeek}
                  onChange={handleWeekChange}
                  onUseSuggested={() => {
                    void handleWeekChange(suggestedWeek);
                  }}
                />

                <RoutineWeekView 
                  week={{
                    ...selectedWeekData,
                    days: visibleDays,
                  }} 
                  rms={userState.rms} 
                  selectedDayIndex={selectedDayIndex}
                  onChangeDayIndex={setSelectedDayIndex}
                  completedDays={completedDaysForWeek}
                  completionTarget={completionTarget}
                  completedCount={completedVisibleDays}
                  onToggleDayCompleted={handleToggleDayCompleted}
                />
              </>
            )}

            {activeTab === 'calibrator' && (
              <RmEditor rms={userState.rms} onSave={handleRmsUpdate} />
            )}

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {isBusy ? (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface/50">Sincronizando cambios...</p>
        ) : null}
      </main>
    </div>
  );
}
