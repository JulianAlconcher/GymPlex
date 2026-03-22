

export type TabId = 'routine' | 'calibrator' | 'profile';

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

// Dumbbell icon for Routine
const RoutineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="m14.5 9.5 5 5" />
    <path d="m4.5 19.5 5-5" />
    <path d="m8.3 11.7 4 4" />
    <path d="m13.4 9.4 1.2-1.2c.8-.8 2-.8 2.8 0l1.4 1.4c.8.8.8 2 0 2.8l-1.2 1.2" />
    <path d="m7.3 13.5-1.2 1.2c-.8.8-2 .8-2.8 0L1.9 13.3c-.8-.8-.8-2 0-2.8l1.2-1.2" />
    <path d="m2 22 2-2" />
    <path d="m20 2 2 2" />
  </svg>
);

// Trending icon for Maxes
const MaxesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

// User icon for Profile
const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4-4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'routine', label: 'ROUTINE', icon: <RoutineIcon /> },
    { id: 'calibrator', label: 'MAXES', icon: <MaxesIcon /> },
    { id: 'profile', label: 'PROFILE', icon: <ProfileIcon /> },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#111111] border-t border-surface-highest">
      <div className="flex h-16 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all
                ${isActive 
                  ? 'text-primary' 
                  : 'text-on-surface/40 hover:bg-surface-highest hover:text-on-surface/60'
                }
              `}
            >
              {/* Top border indicator for active tab */}
              {isActive && (
                <div className="absolute top-0 w-12 h-[3px] bg-primary rounded-b-sm" />
              )}
              
              <div className="transform scale-90">
                {tab.icon}
              </div>
              <span className="text-[9px] font-display font-bold tracking-widest leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
