import { Tabs } from 'expo-router';

import { TabBarIcon } from '../../src/components/TabBarIcon';
import { colors } from '../../src/theme/tokens';

export default function EmpresaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, height: 76 },
      }}
    >
      <Tabs.Screen
        name="panel"
        options={{
          title: 'Panel',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="grid" label="Panel" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="turnos"
        options={{
          title: 'Turnos',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="calendar" label="Turnos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="resenas"
        options={{
          title: 'Reseñas',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="starOutline" label="Reseñas" focused={focused} />,
        }}
      />
      <Tabs.Screen name="alta" options={{ href: null }} />
    </Tabs>
  );
}
