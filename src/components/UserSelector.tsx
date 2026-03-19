type UserSelectorProps = {
  users: string[];
  selectedUser: string;
  onChange: (user: string) => void;
};

export function UserSelector({ users, selectedUser, onChange }: UserSelectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block text-sm font-semibold text-slate-800" htmlFor="user-select">
        Usuario activo
      </label>
      <select
        id="user-select"
        value={selectedUser}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      >
        <option value="" disabled>
          Seleccionar usuario...
        </option>
        {users.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
    </section>
  );
}
