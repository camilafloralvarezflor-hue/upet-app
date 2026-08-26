import { Tabs } from 'expo-router';

import { colors, fonts } from '../../src/theme/tokens';

export default function DuenoLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="mascota" options={{ title: 'Mi mascota' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Tabs.Screen name="turnos" options={{ title: 'Mis turnos' }} />
      <Tabs.Screen name="emergencias" options={{ title: 'Emergencias' }} />
    </Tabs>
  );
}
