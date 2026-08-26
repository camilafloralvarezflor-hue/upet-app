import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { AppSwitch } from '../AppSwitch';
import { Icon } from '../Icon';
import { TextField } from '../TextField';
import { AppText, MutedText } from '../Typography';
import { DIAS_SEMANA } from '../../lib/horarios';
import { rubroLabel } from '../../lib/business-rubros';
import { colors, radii, spacing } from '../../theme/tokens';
import type { AltaFormState } from './types';

const MAX_FOTOS = 3;

interface StepNegocioProps {
  form: AltaFormState;
  onChange: (patch: Partial<AltaFormState>) => void;
  onCambiarRubro: () => void;
}

export function StepNegocio({ form, onChange, onCambiarRubro }: StepNegocioProps) {
  const toggleDia = (dia: string, abierto: boolean) => {
    onChange({
      horarios: {
        ...form.horarios,
        [dia]: abierto ? { abre: '09:00', cierra: '19:00' } : null,
      },
    });
  };

  const setHorario = (dia: string, campo: 'abre' | 'cierra', valor: string) => {
    const actual = form.horarios[dia];
    if (!actual) return;
    onChange({ horarios: { ...form.horarios, [dia]: { ...actual, [campo]: valor } } });
  };

  const agregarFoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      onChange({ fotosLocales: [...form.fotosLocales, result.assets[0].uri] });
    }
  };

  return (
    <View style={styles.content}>
      <View style={styles.field}>
        <MutedText style={styles.label}>Rubro</MutedText>
        <View style={styles.rubroPill}>
          <Icon name="store" size={16} color={colors.primary} strokeWidth={1.8} />
          <AppText variant="bodyMedium" style={styles.rubroLabel}>
            {form.rubro ? rubroLabel(form.rubro) : '—'}
          </AppText>
          <Pressable onPress={onCambiarRubro} hitSlop={8}>
            <AppText variant="bodyMedium" style={styles.cambiarLink}>
              Cambiar
            </AppText>
          </Pressable>
        </View>
      </View>

      <TextField
        label="Nombre del negocio"
        value={form.nombre}
        onChangeText={(nombre) => onChange({ nombre })}
        placeholder="Ej. Paseos con Tato"
      />

      <TextField
        label="Dirección"
        icon="locationPin"
        value={form.direccion}
        onChangeText={(direccion) => onChange({ direccion })}
        placeholder="Buscar dirección…"
      />

      <View style={styles.field}>
        <MutedText style={styles.label}>Horarios de atención</MutedText>
        <View style={styles.horariosCard}>
          {DIAS_SEMANA.map(({ value, label }, index) => {
            const horario = form.horarios[value];
            const abierto = !!horario;
            return (
              <View
                key={value}
                style={[styles.diaRow, index === DIAS_SEMANA.length - 1 && styles.diaRowLast]}
              >
                <View style={styles.diaHeader}>
                  <AppText variant="bodyMedium">{label}</AppText>
                  <AppSwitch value={abierto} onValueChange={(v) => toggleDia(value, v)} />
                </View>
                {abierto ? (
                  <View style={styles.horaInputs}>
                    <View style={styles.horaInput}>
                      <TextField
                        label="Abre"
                        value={horario!.abre}
                        onChangeText={(v) => setHorario(value, 'abre', v)}
                        placeholder="09:00"
                      />
                    </View>
                    <View style={styles.horaInput}>
                      <TextField
                        label="Cierra"
                        value={horario!.cierra}
                        onChangeText={(v) => setHorario(value, 'cierra', v)}
                        placeholder="19:00"
                      />
                    </View>
                  </View>
                ) : (
                  <MutedText>Cerrado</MutedText>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.turnosCard}>
        <View style={styles.turnosIcon}>
          <Icon name="calendar" size={17} color={colors.primary} strokeWidth={1.8} />
        </View>
        <View style={styles.turnosText}>
          <AppText variant="bodyMedium">Turnos online</AppText>
          <MutedText style={styles.turnosSubtitle}>
            Los dueños reservan turno desde la app
          </MutedText>
        </View>
        <AppSwitch
          value={form.turnosHabilitado}
          onValueChange={(v) => onChange({ turnosHabilitado: v })}
        />
      </View>
      <MutedText style={styles.turnosHelper}>
        Podés cambiarlo cuando quieras desde los ajustes de tu perfil.
      </MutedText>

      <View style={styles.field}>
        <MutedText style={styles.label}>Fotos de tu negocio</MutedText>
        <View style={styles.fotosRow}>
          {form.fotosLocales.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.fotoThumb} />
          ))}
          {form.fotosLocales.length < MAX_FOTOS && (
            <Pressable onPress={agregarFoto} style={styles.fotoAdd}>
              <Icon name="camera" size={20} color={colors.textFaint} strokeWidth={1.8} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
  },
  rubroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    backgroundColor: colors.primaryLight,
  },
  rubroLabel: {
    color: colors.primary,
    marginRight: 2,
  },
  cambiarLink: {
    color: colors.primary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  horariosCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  diaRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  diaRowLast: {
    borderBottomWidth: 0,
  },
  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horaInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  horaInput: {
    flex: 1,
  },
  turnosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  turnosIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnosText: {
    flex: 1,
    gap: 2,
  },
  turnosSubtitle: {
    fontSize: 12,
  },
  turnosHelper: {
    fontSize: 12,
    marginTop: -spacing.md + spacing.xs,
  },
  fotosRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fotoThumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
  },
  fotoAdd: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1.6,
    borderStyle: 'dashed',
    borderColor: '#C9C2B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
