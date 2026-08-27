import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { Heading2, MutedText } from '../../src/components/Typography';
import { spacing } from '../../src/theme/tokens';

export default function CheckEmailScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Heading2 style={styles.title}>Confirmá tu email</Heading2>
      <MutedText style={styles.subtitle}>
        Te enviamos un correo para confirmar tu cuenta. Una vez confirmada, iniciá sesión.
      </MutedText>
      <Button label="Ir a iniciar sesión" onPress={() => router.replace('/auth/login')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
