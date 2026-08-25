# UPET

Marketplace móvil de dos lados para dueños de mascotas y empresas del rubro
animal (veterinarias, paseadores, peluqueros, petshops, cuidadores).
Pensado para Argentina/LatAm. App en español.

## Stack

- **App**: React Native + Expo (SDK 57), TypeScript, Expo Router.
- **Backend**: Supabase (Postgres + Auth + Storage + Row Level Security).
- **Mapas/geolocalización**: react-native-maps + Google Maps.
- **Datos remotos**: TanStack Query.
- **Notificaciones push**: Expo Notifications (se agrega en la etapa de turnos).

## Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Supabase](https://supabase.com) y correr las
   migraciones (`supabase/migrations/`, en orden) desde el SQL Editor o con la
   Supabase CLI. La `0002` crea el bucket de Storage `pets` (fotos de
   mascotas), la `0003` el bucket `businesses` (fotos de negocios) y la
   `0004` agrega la columna `servicios` a `businesses`, y la `0005` agrega
   una restricción única (una reseña por dueño y negocio).

3. Copiar `.env.example` a `.env` y completar:

   ```bash
   cp .env.example .env
   ```

4. Levantar el proyecto:

   ```bash
   npx expo start
   ```

## Estructura

```
app/                    Rutas de Expo Router
  index.tsx             Registro / selección de rol
  auth/                 Alta de cuenta, login, aviso de confirmación de email
  mascota/              CRUD de mascotas y vacunas (lista, detalle, alta, edición)
  (dueno)/              Tabs del dueño: mascota, buscar, emergencias
  (empresa)/            Tabs de la empresa: panel, turnos, reseñas, alta (wizard de 3 pasos)
  negocio/[id].tsx       Ficha pública de una empresa
  negocio/[id]/reservar.tsx  Placeholder de reserva de turno (etapa 8)
  negocio/[id]/resena.tsx    Escribir/editar tu reseña (dueño)
src/
  theme/tokens.ts        Paleta, tipografía, spacing (design tokens del Figma)
  lib/supabase.ts        Cliente de Supabase
  lib/auth-context.tsx   Sesión de Supabase en contexto (AuthProvider)
  lib/storage.ts         Subida de fotos (mascotas/negocios) a Supabase Storage
  lib/vaccine-status.ts  Cálculo de estado de vacuna y formateo de fechas
  lib/business-rubros.ts Rubros de empresa (veterinaria, paseador, etc.)
  lib/horarios.ts        Días de la semana y horarios por defecto
  lib/geocode.ts         Geocodifica direcciones a lat/lng (expo-location)
  lib/geo.ts             Distancia entre coordenadas y formateo
  lib/business-hours-status.ts  Abierto/cerrado en base a horarios + hora actual
  lib/database.types.ts  Tipos TS del modelo de datos
  lib/query-client.ts    QueryClient de TanStack Query
  hooks/                 usePets, useVaccines, useProfile, useBusiness(es),
                         useReviews, useUserLocation (TanStack Query)
  components/            UI compartida (Screen, Typography, Button, PetForm,
                         BusinessCard, StarRating, RubroFilterChips, etc.)
  components/alta/       Pasos del wizard de alta de empresa
  components/RouteGuard.tsx  Redirige según sesión/rol
supabase/migrations/     Esquema SQL, políticas de RLS y buckets de Storage
```

## Modelo de datos

Ver `supabase/migrations/`. Tablas: `profiles`, `pets`, `vaccines`,
`businesses` (con `turnos_habilitado` y `servicios`, agregado en la `0004`),
`reviews` (una por dueño y negocio, restricción agregada en la `0005`),
`emergency_contacts`, `appointments`.

## Diseño

Paleta: verde `#2E6F5E`, crema `#FBF8F4`, texto oscuro `#1E2823`, verde claro
`#EAF3F0`, dorado `#E8A33D`, gris texto `#5B6B65` / `#8A9A94`, bordes
`#E4E0D8`. Tipografía: Sora para títulos, Inter para el resto del texto.

Especificación visual: [Figma](https://www.figma.com/design/wp34pCoyxiTcbsoG2uV0A9).

## Etapas de construcción

1. ✅ Fundaciones: proyecto Expo + Supabase, tokens de diseño, esqueleto de
   navegación.
2. ✅ Autenticación y selección de rol dueño/empresa.
3. ✅ CRUD de mascotas + carnet de vacunas.
4. ✅ Alta de empresa multi-paso, con el toggle de turnos online.
5. ✅ Búsqueda geolocalizada por rubro + ficha pública de empresa.
6. ✅ Reseñas vinculadas a contacto real, con respuesta pública de la empresa.
7. Sector de emergencias con llamada de un toque.
8. Panel de empresa (estadísticas + destacado) y agenda de turnos.
