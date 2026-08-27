import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { Heading2, MutedText } from '../../src/components/Typography';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing } from '../../src/theme/tokens';

type Role = 'dueno' | 'empresa';

const ROLE_LABEL: Record<Role, string> = {
  dueno: 'dueño de mascota',
  empresa: 'empresa',
};

const ROLE_HOME: Record<Role, string> = {
  dueno: '/(dueno)/mascota',
  empresa: '/(empresa)/alta',
};

export default function SignUpScreen() {
  const router = useRouter();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: Role = roleParam === 'empresa' ? 'empresa' : 'dueno';

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEnviar = nombre.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async () => {
    if (!puedeEnviar || loading) return;
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('No se pudo crear la cuenta. Intentá de nuevo.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      nombre: nombre.trim(),
      telefono: telefono.trim() || null,
    });

    setLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (!data.session) {
      router.replace('/auth/check-email');
      return;
    }

    router.replace(ROLE_HOME[role] as never);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MutedText>‹ Volver</MutedText>
        </Pressable>

        <Heading2 style={styles.title}>Creá tu cuenta</Heading2>
        <MutedText style={styles.subtitle}>Te estás registrando como {ROLE_LABEL[role]}.</MutedText>

        <View style={styles.form}>
          <TextField label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Tu nombre" />
          <TextField
            label="Teléfono (opcional)"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="+54 9 ..."
            keyboardType="phone-pad"
          />
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />
        </View>

        {error && <MutedText style={styles.error}>{error}</MutedText>}

        <Button
          label={loading ? 'Creando cuenta…' : 'Crear cuenta'}
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
