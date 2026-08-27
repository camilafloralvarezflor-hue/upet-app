import { Tabs } from 'expo-router';

import { TabBarIcon } from '../../src/components/TabBarIcon';
import { colors } from '../../src/theme/tokens';

export default function DuenoLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, height: 76 },
      }}
    >
      <Tabs.Screen
        name="mascota"
        options={{
          title: 'Mi mascota',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="paw" label="Mascotas" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="search" label="Buscar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="turnos"
        options={{
          title: 'Mis turnos',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="calendar" label="Turnos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="emergencias"
        options={{
          title: 'Emergencias',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              icon="shieldAlert"
              label="Emergencias"
              focused={focused}
              activeColor={colors.dangerText}
              activeBg={colors.dangerBg}
            />
          ),
        }}
      />
      <Tabs.Screen name="pagos" options={{ href: null }} />
    </Tabs>
  );
}
