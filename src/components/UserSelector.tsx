import { USER_AVATARS } from '../data/users';
import type { AppUser } from '../types/routine';

type UserSelectorProps = {
  users: AppUser[];
  selectedUserId: string;
  onChange: (user: string) => void;
  hideTitle?: boolean;
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function UserSelector({ users, selectedUserId, onChange, hideTitle }: UserSelectorProps) {
  return (
    <div className="w-full flex flex-col items-center py-8">
      {!hideTitle && (
        <h2 className="text-4xl font-display font-bold uppercase tracking-tighter text-on-surface text-center mb-10 leading-none">
          ¿QUIÉN <span className="text-primary">ENTRENA</span><br />
          HOY?
        </h2>
      )}

      <div className="flex flex-wrap justify-center gap-4 w-full max-w-md px-4">
        {users.map((user) => {
          const isActive = user.id === selectedUserId;
          const rawAvatar = USER_AVATARS[user.fullName];
          const avatarUrl = rawAvatar ? import.meta.env.BASE_URL + (rawAvatar.startsWith('/') ? rawAvatar.slice(1) : rawAvatar) : undefined;

          return (
            <button
              key={user.id}
              onClick={() => onChange(user.id)}
              className={`w-[calc(50%-0.5rem)] flex flex-col items-center justify-center py-8 px-4 gap-4 bg-surface-highest transition-all ${isActive ? 'ring-2 ring-primary ring-inset' : 'hover:bg-surface'
                }`}
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold shadow-xl overflow-hidden ${
                isActive ? 'bg-primary text-white' : 'bg-surface-low text-on-surface/50 grayscale'
              }`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={getInitials(user.fullName)} className="w-full h-full object-cover text-[0px]" />
                ) : (
                  getInitials(user.fullName)
                )}
              </div>
              <span className={`font-display text-sm font-bold tracking-widest uppercase mt-2 ${isActive ? 'text-primary' : 'text-on-surface/80'
                }`}>
                {user.fullName.split(' ')[0]}
              </span>
            </button>
          );
        })}

      </div>
    </div>
  );
}
