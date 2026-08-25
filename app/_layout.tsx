import { useCallback, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useSession } from '../src/lib/auth-context';
import { queryClient } from '../src/lib/query-client';
import { RouteGuard } from '../src/components/RouteGuard';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { isLoading } = useSession();

  const onLayout = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (isLoading) {
    return null;
  }

  return (
    <RouteGuard>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(dueno)" />
        <Stack.Screen name="(empresa)" />
        <Stack.Screen name="negocio/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </RouteGuard>
  );
}
