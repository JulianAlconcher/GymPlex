import type { AppUser } from '../types/routine';

type UserSelectorProps = {
  users: AppUser[];
  selectedUserId: string;
  onChange: (user: string) => void;
};

export function UserSelector({ users, selectedUserId, onChange }: UserSelectorProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block font-display text-xs font-bold uppercase tracking-widest text-on-surface/70" htmlFor="user-select">
        Usuario Activo
      </label>
      <select
        id="user-select"
        value={selectedUserId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-b-2 border-outline-variant bg-surface-highest px-4 py-3 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none"
      >
        <option value="" disabled className="text-on-surface/50">
          SELECCIONAR USUARIO...
        </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
