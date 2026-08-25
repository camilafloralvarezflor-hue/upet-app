import { Pressable, StyleSheet } from 'react-native';

import { MutedText } from './Typography';
import { supabase } from '../lib/supabase';
import { spacing } from '../theme/tokens';

export function SignOutButton() {
  return (
    <Pressable style={styles.button} onPress={() => supabase.auth.signOut()} hitSlop={8}>
      <MutedText>Cerrar sesión</MutedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.lg,
  },
});
