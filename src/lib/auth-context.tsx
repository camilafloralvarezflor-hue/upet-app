import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';
import { registerForPushNotificationsAsync } from './push-notifications';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, isLoading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      registerForPushNotificationsAsync(session.user.id);
    }
  }, [session?.user.id]);

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
}

export function useSession() {
  return useContext(AuthContext);
}
