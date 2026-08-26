import { Pressable, StyleSheet } from 'react-native';

import { MutedText } from './Typography';
import { detenerTrackingEnSegundoPlano } from '../lib/background-location-task';
import { supabase } from '../lib/supabase';
import { spacing } from '../theme/tokens';

export function SignOutButton() {
  const handlePress = async () => {
    // Por si cierra sesión con un paseo en curso: no dejar el tracking
    // publicando ubicación en segundo plano después del logout.
    await detenerTrackingEnSegundoPlano();
    await supabase.auth.signOut();
  };

  return (
    <Pressable style={styles.button} onPress={handlePress} hitSlop={8}>
      <MutedText>Cerrar sesión</MutedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.lg,
  },
});
