import { Tabs } from 'expo-router';

import { colors, fonts } from '../../src/theme/tokens';

export default function EmpresaLayout() {
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
      <Tabs.Screen name="panel" options={{ title: 'Panel' }} />
      <Tabs.Screen name="turnos" options={{ title: 'Turnos' }} />
      <Tabs.Screen name="resenas" options={{ title: 'Reseñas' }} />
      <Tabs.Screen name="alta" options={{ href: null }} />
    </Tabs>
  );
}
