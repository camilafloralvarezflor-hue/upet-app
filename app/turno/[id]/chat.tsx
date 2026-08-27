import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Icon } from '../../../src/components/Icon';
import { Screen } from '../../../src/components/Screen';
import { AppText, MutedText } from '../../../src/components/Typography';
import { useAppointment } from '../../../src/hooks/useAppointments';
import { useMessages, useSendMessage } from '../../../src/hooks/useMessages';
import { useProfile } from '../../../src/hooks/useProfile';
import { useSession } from '../../../src/lib/auth-context';
import { colors, radii, spacing } from '../../../src/theme/tokens';

export default function ChatTurnoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data: turno, isLoading } = useAppointment(id);
  const { data: profile } = useProfile();
  const mensajes = useMessages(id);
  const sendMessage = useSendMessage(id);
  const [texto, setTexto] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  if (isLoading || !turno || !profile) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand900} />
        </View>
      </Screen>
    );
  }

  const esDueno = profile.role === 'dueno';
  const nombreOtro = esDueno ? turno.businesses?.nombre : turno.profiles?.nombre;
  const enCurso = turno.estado === 'en_curso';

  const handleEnviar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    sendMessage.mutate(limpio);
    setTexto('');
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.textDark} strokeWidth={2.75} />
        </Pressable>
        <View style={styles.headerAvatar} />
        <View style={styles.headerText}>
          <AppText variant="bodyMedium">{nombreOtro ?? (esDueno ? 'Paseador' : 'Dueño')}</AppText>
          {enCurso && (
            <View style={styles.headerStatus}>
              <View style={styles.headerDot} />
              <MutedText style={styles.headerStatusText}>
                En paseo con {turno.pets?.nombre ?? 'tu mascota'}
              </MutedText>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {mensajes.length === 0 && (
          <MutedText style={styles.empty}>Todavía no hay mensajes en esta conversación.</MutedText>
        )}
        {mensajes.map((mensaje) => {
          const esMio = mensaje.sender_id === session?.user.id;
          return (
            <View
              key={mensaje.id}
              style={[styles.bubble, esMio ? styles.bubbleMio : styles.bubbleOtro]}
            >
              <AppText style={esMio ? styles.bubbleTextMio : styles.bubbleTextOtro}>
                {mensaje.texto}
              </AppText>
            </View>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribir un mensaje…"
            placeholderTextColor={colors.textFainter}
            style={styles.input}
            multiline
          />
          <Pressable onPress={handleEnviar} style={styles.sendButton} disabled={sendMessage.isPending}>
            <Icon name="navigation" size={18} color={colors.brand200} strokeWidth={2.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 3,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(32,30,29,0.1)',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand200,
  },
  headerText: {
    flex: 1,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  headerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.brand500,
  },
  headerStatusText: {
    fontSize: 11.5,
    color: colors.brand700,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    gap: spacing.sm + 3,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  bubble: {
    maxWidth: '80%',
    padding: 13,
    paddingHorizontal: 15,
  },
  bubbleMio: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand900,
    borderRadius: 22,
    borderBottomRightRadius: 8,
  },
  bubbleOtro: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: 22,
    borderBottomLeftRadius: 8,
  },
  bubbleTextMio: {
    color: colors.onDark,
    fontSize: 13.5,
    lineHeight: 19,
  },
  bubbleTextOtro: {
    color: colors.textDark,
    fontSize: 13.5,
    lineHeight: 19,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.pill,
    paddingVertical: 13,
    paddingHorizontal: 17,
    fontSize: 14,
    color: colors.textDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.brand900,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
