# GymPlex

Aplicación web simple para gestionar rutinas de gimnasio por semanas, sin backend y con persistencia local.

## Stack

- React + Vite
- TailwindCSS
- localStorage

## Ejecutar

```bash
npm install
npm run dev
```

## Qué incluye

- Selección manual de usuario (5 usuarios fijos)
- Onboarding inicial por usuario para cargar RM
- Persistencia por usuario (RM, semana y estado de onboarding)
- Selección manual de semana + sugerencia automática por fecha
- Cálculo de cargas para ejercicios con porcentaje de RM
- Edición de RM en cualquier momento

## Estructura

- `src/data`: datos estáticos (`routineData`, usuarios, ejercicios clave)
- `src/lib`: lógica de negocio (`storage`, cálculo, sugerencia de semana)
- `src/components`: UI reutilizable
- `src/App.tsx`: orquestación principal
