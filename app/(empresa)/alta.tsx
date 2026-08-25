import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { SignOutButton } from '../../src/components/SignOutButton';
import { AppText, MutedText } from '../../src/components/Typography';
import { StepProgress } from '../../src/components/alta/StepProgress';
import { StepRubro } from '../../src/components/alta/StepRubro';
import { StepNegocio } from '../../src/components/alta/StepNegocio';
import { StepContacto } from '../../src/components/alta/StepContacto';
import type { AltaFormState } from '../../src/components/alta/types';
import { useCreateBusiness } from '../../src/hooks/useBusiness';
import { useSession } from '../../src/lib/auth-context';
import { defaultHorarios } from '../../src/lib/horarios';
import { queryClient } from '../../src/lib/query-client';
import { supabase } from '../../src/lib/supabase';
import { uploadBusinessPhoto } from '../../src/lib/storage';
import { colors, spacing } from '../../src/theme/tokens';

const SUBTITLES: Record<number, string> = {
  1: 'Paso 1 de 3 · ¿A qué te dedicás?',
  2: 'Paso 2 de 3 · Contanos sobre tu negocio',
  3: 'Paso 3 de 3 · Datos de contacto',
};

export default function AltaEmpresaScreen() {
  const router = useRouter();
  const { session } = useSession();
  const createBusiness = useCreateBusiness();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AltaFormState>({
    rubro: null,
    nombre: '',
    direccion: '',
    horarios: defaultHorarios(),
    turnosHabilitado: false,
    fotosLocales: [],
    telefono: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchForm = (patch: Partial<AltaFormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const puedeAvanzarPaso1 = !!form.rubro;
  const puedeAvanzarPaso2 = form.nombre.trim().length > 0 && form.direccion.trim().length > 0;
  const puedeAvanzarPaso3 = form.telefono.trim().length > 0;

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePublicar = async () => {
    if (!puedeAvanzarPaso3 || saving || !session?.user.id) return;
    setSaving(true);
    setError(null);

    try {
      const business = await createBusiness.mutateAsync({
        rubro: form.rubro as string,
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        lat: null,
        lng: null,
        horarios: form.horarios,
        fotos: [],
        telefono: form.telefono.trim(),
        turnos_habilitado: form.turnosHabilitado,
      });

      if (form.fotosLocales.length > 0) {
        const urls = await Promise.all(
          form.fotosLocales.map((uri, index) =>
            uploadBusinessPhoto(session.user.id, business.id, index, uri)
          )
        );
        const { error: fotosError } = await supabase
          .from('businesses')
          .update({ fotos: urls })
          .eq('id', business.id);
        if (fotosError) throw fotosError;
        queryClient.invalidateQueries({ queryKey: ['business', 'mine', session.user.id] });
      }

      router.replace('/(empresa)/panel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu negocio.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinuar = () => {
    if (step === 3) {
      handlePublicar();
      return;
    }
    setStep(step + 1);
  };

  const continuarDisabled =
    (step === 1 && !puedeAvanzarPaso1) ||
    (step === 2 && !puedeAvanzarPaso2) ||
    (step === 3 && !puedeAvanzarPaso3);

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12} disabled={step === 1}>
          <AppText variant="h3" style={step === 1 && styles.backHidden}>
            ‹
          </AppText>
        </Pressable>
        <AppText variant="bodyMedium" style={styles.headerTitle}>
          Alta de tu negocio
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressBlock}>
        <StepProgress step={step} />
        <MutedText style={styles.stepSubtitle}>{SUBTITLES[step]}</MutedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <StepRubro value={form.rubro} onSelect={(rubro) => patchForm({ rubro })} />
        )}
        {step === 2 && (
          <StepNegocio form={form} onChange={patchForm} onCambiarRubro={() => setStep(1)} />
        )}
        {step === 3 && <StepContacto form={form} onChange={patchForm} />}

        {error && <MutedText style={styles.error}>{error}</MutedText>}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step === 3 ? (saving ? 'Publicando…' : 'Publicar perfil') : 'Continuar'}
          onPress={handleContinuar}
          disabled={continuarDisabled || saving}
        />
        {step === 1 && <SignOutButton />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
  },
  headerSpacer: {
    width: 20,
  },
  backHidden: {
    opacity: 0,
  },
  progressBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 13,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});
