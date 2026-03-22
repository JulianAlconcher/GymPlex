# GymPlex

Aplicación web para gestionar rutinas y RM por usuario, ahora con persistencia en Supabase y panel administrador.

## Stack

- React + Vite
- TailwindCSS
- Supabase (Postgres)

## Configuración Supabase

1. Creá un proyecto en Supabase.
2. Ejecutá el script [supabase/schema.sql](/Users/julianalconcher/Documents/GitHub/GymPlex/supabase/schema.sql) en SQL Editor.
3. Copiá `.env.example` a `.env` y completá:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Si no configurás estas variables, la app entra en modo fallback local.

## Ejecutar

```bash
npm install
npm run dev
```

## Qué incluye

- Usuarios en base de datos (`profiles`)
- Estado por usuario (RM, semana y onboarding) en `user_states`
- Rutinas por semana en `routine_weeks`
- Panel administrador (solo usuarios con `is_admin = true`) para:
  - crear usuarios
  - asignar/quitar admin
  - editar JSON de una semana de rutina
  - importar rutina base desde archivo local al DB

## Estructura

- `src/lib/supabaseClient.ts`: cliente Supabase
- `src/lib/db.ts`: acceso a datos (usuarios, rutinas, estado)
- `src/components/AdminPanel.tsx`: panel de administración
- `supabase/schema.sql`: esquema y seed inicial
