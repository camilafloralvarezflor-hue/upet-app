import { PropsWithChildren, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useSession } from '../lib/auth-context';
import { ROLE_HOME } from '../lib/navigation';
import { useProfile } from '../hooks/useProfile';

const APP_GROUPS = ['(dueno)', '(empresa)', 'negocio', 'turno', 'paseo-grupal'];

export function RouteGuard({ children }: PropsWithChildren) {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (sessionLoading) return;

    const inAppGroup = APP_GROUPS.includes(segments[0] ?? '');
    const inAuthGroup = segments[0] === 'auth';

    if (!session) {
      if (inAppGroup) router.replace('/');
      return;
    }

    if (profileLoading) return;

    if (profile && (segments[0] === undefined || inAuthGroup)) {
      router.replace(ROLE_HOME[profile.role] as never);
    }
  }, [session, sessionLoading, profile, profileLoading, segments, router]);

  return children;
}
