# Mawis

Marketplace móvil de dos lados enfocado en paseo y cuidado de mascotas
(dog walking / pet sitting): dueños de mascotas contratando paseadores y
cuidadores. Registro gratuito para los dos lados; la plataforma se queda
con una comisión configurable sobre lo que cobra cada prestador por
servicio. Pensado para Argentina/LatAm. App en español.

Otros rubros (veterinaria, peluquería, petshop) ya están contemplados en
el modelo de datos pero **no están activos todavía** — quedan reservados
para una fase futura (ver `src/lib/business-rubros.ts`).

## Stack

- **App**: React Native + Expo (SDK 57), TypeScript, Expo Router.
- **Backend**: Supabase (Postgres + Auth + Storage + Row Level Security).
- **Mapas/geolocalización**: react-native-maps + Google Maps.
- **Datos remotos**: TanStack Query.
- **Notificaciones push**: Expo Notifications (agregado en la Etapa 8, junto con turnos).
- **Íconos**: set propio de íconos de línea (`src/components/Icon.tsx`) sobre
  `react-native-svg`, calcado 1:1 de los mockups de diseño en vez de una
  librería de íconos genérica.

## Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Supabase](https://supabase.com) y correr las
   migraciones (`supabase/migrations/`, en orden) desde el SQL Editor o con la
   Supabase CLI. La `0002` crea el bucket de Storage `pets` (fotos de
   mascotas), la `0003` el bucket `businesses` (fotos de negocios) y la
   `0004` agrega la columna `servicios` a `businesses`, la `0005` agrega
   una restricción única (una reseña por dueño y negocio), la `0006`
   agrega `especialidad` a `emergency_contacts`, la `0007` crea
   `business_events` (estadísticas del Panel), la `0008` agrega la función
   `get_booked_slots` (disponibilidad de turnos), la `0009` agrega
   `expo_push_token` a `profiles`, la `0010` restringe qué columnas de
   `profiles` son de lectura pública (importante correrla: sin ella
   `telefono` y `expo_push_token` quedarían públicos), la `0011` agrega los
   estados `en_curso`/`completado` a los turnos y los campos de cobro
   (`monto`/`comision_pct`/`pagado`), y la `0012` crea `walk_locations` y la
   habilita en Supabase Realtime (necesaria para el tracking en vivo).

3. Copiar `.env.example` a `.env` y completar:

   ```bash
   cp .env.example .env
   ```

4. Levantar el proyecto:

   ```bash
   npx expo start
   ```

   **Ojo con el tracking en vivo**: el resto de la app funciona en Expo Go,
   pero la ubicación en segundo plano (`expo-location` background +
   `expo-task-manager`) **no funciona en Expo Go** — hace falta un
   development build:

   ```bash
   npx expo run:ios      # o npx expo run:android
   # o, sin Mac / para probar en un dispositivo real:
   eas build --profile development --platform ios
   ```

## Estructura

```
app/                    Rutas de Expo Router
  index.tsx             Registro / selección de rol
  auth/                 Alta de cuenta, login, aviso de confirmación de email
  mascota/              CRUD de mascotas y vacunas (lista, detalle, alta, edición)
  (dueno)/              Tabs del dueño: mascota, buscar, turnos, emergencias
  (empresa)/            Tabs de la empresa: panel, turnos, reseñas, alta (wizard de 3 pasos)
  negocio/[id].tsx       Ficha pública de una empresa (paseador/cuidador)
  negocio/[id]/reservar.tsx  Reservar turno (dueño): mascota, día y horario disponible
  negocio/[id]/resena.tsx    Escribir/editar tu reseña (dueño)
  turno/[id]/en-vivo.tsx     Tracking en vivo: el paseador comparte ubicación,
                             el dueño ve el mapa (solo mientras el turno
                             está "en_curso")
src/
  theme/tokens.ts        Paleta, tipografía, spacing (design tokens del Figma)
  lib/supabase.ts        Cliente de Supabase
  lib/auth-context.tsx   Sesión de Supabase en contexto (AuthProvider)
  lib/storage.ts         Subida de fotos (mascotas/negocios) a Supabase Storage
  lib/vaccine-status.ts  Cálculo de estado de vacuna y formateo de fechas
  lib/business-rubros.ts Rubros de empresa — solo paseador/cuidador activos,
                         el resto queda reservado a futuro
  lib/horarios.ts        Días de la semana y horarios por defecto
  lib/geocode.ts         Geocodifica direcciones a lat/lng (expo-location)
  lib/geo.ts             Distancia entre coordenadas y formateo
  lib/business-hours-status.ts  Abierto/cerrado en base a horarios + hora actual
  lib/turnos-slots.ts    Genera horarios disponibles para reservar un turno
  lib/comision.ts        % de comisión de la plataforma (configurable) + cálculo del neto
  lib/push-notifications.ts  Registro y envío de notificaciones push (Expo)
  lib/background-location-task.ts  Tracking en segundo plano (TaskManager):
                         arranca/para la publicación de ubicación del paseador,
                         sigue funcionando con la app minimizada o el celular
                         bloqueado
  lib/database.types.ts  Tipos TS del modelo de datos
  lib/query-client.ts    QueryClient de TanStack Query
  hooks/                 usePets, useVaccines, useProfile, useBusiness(es),
                         useReviews, useUserLocation, useEmergencyContacts,
                         useAppointments (agenda + cobro), useBusinessStats,
                         useWalkTracking (useWalkTrail: lado dueño, mira el
                         recorrido por Realtime)
  components/            UI compartida (Screen, Typography, Button, PetForm,
                         BusinessCard, StarRating, RubroFilterChips, etc.)
  components/alta/       Pasos del wizard de alta de empresa
  components/RouteGuard.tsx  Redirige según sesión/rol
supabase/migrations/     Esquema SQL, políticas de RLS, buckets de Storage,
                         funciones (disponibilidad de turnos, push token) y
                         Realtime (tracking en vivo)
```

## Modelo de datos

Ver `supabase/migrations/`. Tablas: `profiles` (con `expo_push_token`,
agregado en la `0009`, y columnas públicas restringidas en la `0010`),
`pets`, `vaccines`, `businesses` (con `turnos_habilitado` y `servicios`,
agregado en la `0004`), `reviews` (una por dueño y negocio, restricción
agregada en la `0005`), `emergency_contacts` (con `especialidad`, agregado
en la `0006`), `business_events` (agregada en la `0007`, para las
estadísticas del Panel de la empresa), `appointments` (estados
`pendiente → confirmado → en_curso → completado`, o `cancelado`; con
`monto`/`comision_pct`/`pagado` agregados en la `0011`), y
`walk_locations` (agregada en la `0012`, con Realtime habilitado, para el
recorrido en vivo del paseo).

## Cambios de producto sobre el MVP original

- **Rename a Mawis**: nombre de producto en `app.json`, textos, README. El
  repo de GitHub sigue siendo `upet-app` a propósito.
- **Reenfoque a Paseo/Cuidado**: `RUBROS_ACTIVOS` en
  `src/lib/business-rubros.ts` es hoy solo Paseador/Cuidador. Veterinaria,
  Peluquería y Petshop siguen en el modelo de datos (`RUBROS`) pero no se
  muestran en el alta ni en los filtros de búsqueda hasta que se reactiven.
- **Registro gratuito**: ya lo era desde el MVP original — no hay paywall
  en ningún alta.
- **Comisión por servicio**: `src/lib/comision.ts` define
  `COMISION_PLATAFORMA_PCT` (15% de ejemplo) y `calcularNeto()`. El
  prestador carga el monto que cobró al finalizar el paseo (pantalla
  Turnos de la empresa), la app calcula y muestra comisión/neto, y guarda
  el `comision_pct` vigente en ese momento en el propio turno. **No hay
  procesador de pagos real conectado todavía** — ver el `TODO(pagos)` en
  `src/lib/comision.ts`.
- **Tracking en vivo, estilo Uber (en segundo plano)**: al tocar "Iniciar
  paseo" (Turnos, lado empresa), `iniciarTrackingEnSegundoPlano` pide
  permiso de ubicación "siempre" y arranca `Location.startLocationUpdatesAsync`
  con una tarea de `expo-task-manager` — sigue publicando a `walk_locations`
  cada ~8 s / 15 m aunque el paseador **minimice la app o bloquee el
  celular**, sin depender de que ninguna pantalla siga abierta. Del lado
  dueño, `useWalkTrail` recibe esas posiciones por Supabase Realtime y las
  dibuja en un mapa (`app/turno/[id]/en-vivo.tsx`), con la tab nueva **"Mis
  turnos"** como entrada. El tracking se corta al finalizar el paseo
  (`detenerTrackingEnSegundoPlano`) o al cerrar sesión.

  Requiere permiso de ubicación "Always"/"Permitir siempre" (si el usuario
  solo concede "mientras se usa la app", se avisa y no arranca) y **un
  development build** — Expo Go no soporta `startLocationUpdatesAsync` en
  segundo plano (se agregaron `expo-task-manager` y `expo-dev-client`; ver
  Setup). Pendiente de probar en dispositivos reales: el comportamiento
  exacto de foreground service (Android) y del indicador de ubicación en
  background (iOS) solo se puede validar en un build nativo, no en este
  entorno.

## Implementación de mockups (Claude Design)

Las 8 pantallas principales (Registro, Perfil de mascota, Búsqueda, Emergencias,
Alta de empresa, Perfil público, Panel y Turnos) se re-implementaron pixel a
pixel a partir de un set de mockups de diseño, reemplazando los placeholders
de etapas anteriores por los colores, tipografía, espaciados y componentes
exactos del diseño:

- Set de íconos propio (`src/components/Icon.tsx`) con los mismos trazos SVG
  de los mockups (pata, tienda, jeringa, ubicación, teléfono, estrella, etc.),
  sobre `react-native-svg`.
- `Button` ahora tiene variante `dark` (fondo `#1E2823`) para los CTA
  principales, que en el diseño no usan el verde primario.
- `TextField` acepta un ícono inicial opcional (dirección, búsqueda).
- Barra de tabs (dueño y empresa) rediseñada con píldora activa
  ícono+etiqueta, igual que el mockup — se mantienen las mismas 4 tabs de cada
  lado, sin agregar las tabs "Inicio" y "Perfil" que aparecen en el mockup
  (no tienen pantalla propia en el diseño ni en el modelo de datos todavía).
- Búsqueda cercana suma el toggle Lista/Mapa del mockup con un `MapView` real
  (marcadores por negocio).
- Ficha pública de empresa: header con gradiente (`expo-linear-gradient`)
  cuando no hay foto, insignia de verificado, corazón de favorito (solo
  visual/local, no hay tabla de favoritos todavía).
- El botón "+" del header de Turnos (empresa) del mockup no se implementó:
  no hay flujo para que una empresa cargue un turno manualmente, y agregarlo
  hubiera significado inventar una función fuera del alcance pedido.
- Los mockups muestran "Veterinaria" como rubro de ejemplo en el alta y en los
  chips de búsqueda; se mantuvo la restricción ya vigente de
  `RUBROS_ACTIVOS` (solo Paseador/Cuidador) en vez de reactivar Veterinaria,
  respetando el cambio de producto "Reenfoque a Paseo/Cuidado" de más arriba.

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
7. ✅ Sector de emergencias con llamada de un toque.
8. ✅ Panel de empresa (estadísticas + destacado) y agenda de turnos.
