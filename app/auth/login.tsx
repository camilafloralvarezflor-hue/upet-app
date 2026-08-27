import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { Heading2, MutedText } from '../../src/components/Typography';
import { supabase } from '../../src/lib/supabase';
import type { UserRole } from '../../src/lib/database.types';
import { ROLE_HOME } from '../../src/lib/navigation';
import { colors, spacing } from '../../src/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEnviar = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async () => {
    if (!puedeEnviar || loading) return;
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      setError('No pudimos encontrar tu perfil. Contactanos si el problema persiste.');
      return;
    }

    router.replace(ROLE_HOME[profile.role as UserRole] as never);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MutedText>‹ Volver</MutedText>
        </Pressable>

        <Heading2 style={styles.title}>Iniciar sesión</Heading2>
        <MutedText style={styles.subtitle}>Ingresá con tu email y contraseña.</MutedText>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
          />
        </View>

        {error && <MutedText style={styles.error}>{error}</MutedText>}

        <Button
          label={loading ? 'Ingresando…' : 'Ingresar'}
          onPress={handleSubmit}
          disabled={!puedeEnviar || loading}
          style={styles.submit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
