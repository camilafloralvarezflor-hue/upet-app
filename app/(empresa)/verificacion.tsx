import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Icon, type IconName } from '../../src/components/Icon';
import { Screen } from '../../src/components/Screen';
import { AppText, MutedText } from '../../src/components/Typography';
import { useMyBusiness } from '../../src/hooks/useBusiness';
import { useSubirDocumentoVerificacion, useWalkerVerifications } from '../../src/hooks/useWalkerVerifications';
import { useSession } from '../../src/lib/auth-context';
import type { VerificacionEstado, VerificacionTipo } from '../../src/lib/database.types';
import { colors, radii, spacing } from '../../src/theme/tokens';

const DOCUMENTOS: {
  tipo: VerificacionTipo;
  titulo: string;
  icon: IconName;
  subible: boolean;
}[] = [
  { tipo: 'dni', titulo: 'DNI frente y dorso', icon: 'checkBadge', subible: true },
  { tipo: 'selfie', titulo: 'Selfie con documento', icon: 'checkBadge', subible: true },
  { tipo: 'antecedentes', titulo: 'Antecedentes penales', icon: 'alertCircle', subible: false },
  { tipo: 'primeros_auxilios', titulo: 'Primeros auxilios caninos', icon: 'plus', subible: false },
];

const ESTADO_TEXTO: Record<VerificacionEstado, string> = {
  pendiente: 'Todavía no lo cargaste',
  en_revision: 'En revisión · 24 a 48 hs',
  validado: 'Validado',
  rechazado: 'Rechazado — volvé a subirlo',
};

export default function VerificacionScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const { data: verificaciones, isLoading } = useWalkerVerifications(business?.id);
  const subirDocumento = useSubirDocumentoVerificacion(business?.id, session?.user.id);

  if (loadingBusiness || isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brand900} />
        </View>
      </Screen>
    );
  }

  const estadoPorTipo = new Map(verificaciones?.map((v) => [v.tipo, v]));
  const completos = DOCUMENTOS.filter((d) => estadoPorTipo.get(d.tipo)?.estado === 'validado').length;

  const handleTap = (tipo: VerificacionTipo, subible: boolean) => {
    if (tipo === 'primeros_auxilios') {
      Alert.alert('Todavía no está disponible', 'El curso de primeros auxilios caninos se suma pronto.');
      return;
    }
    if (!subible) return;
    subirDocumento.mutate(tipo);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="chevronLeft" size={18} color={colors.textDark} strokeWidth={2.75} />
        </Pressable>
        <AppText variant="h2">Verificación</AppText>
      </View>

      <View style={styles.resumen}>
        <View style={styles.resumenIcon}>
          <Icon name="shieldAlert" size={28} color={colors.brand700} strokeWidth={2} />
        </View>
        <View style={styles.resumenText}>
          <AppText variant="h2" style={styles.resumenTitulo}>
            Perfil verificado
          </AppText>
          <MutedText style={styles.resumenSubtitulo}>
            {completos} de {DOCUMENTOS.length} pasos completos.
          </MutedText>
        </View>
      </View>

      <View style={styles.lista}>
        {DOCUMENTOS.map((doc) => {
          const verificacion = estadoPorTipo.get(doc.tipo);
          const estado = verificacion?.estado ?? 'pendiente';
          const validado = estado === 'validado';
          const destacado = doc.tipo === 'primeros_auxilios';

          return (
            <Pressable
              key={doc.tipo}
              onPress={() => handleTap(doc.tipo, doc.subible)}
              style={[styles.docCard, destacado && styles.docCardDestacado]}
              disabled={subirDocumento.isPending || (!doc.subible && doc.tipo !== 'primeros_auxilios')}
            >
              <View style={[styles.docIcon, validado && styles.docIconValidado]}>
                <Icon
                  name={validado ? 'checkBadge' : doc.icon}
                  size={17}
                  color={validado ? colors.brandDark : colors.iconFaint}
                  strokeWidth={2.2}
                />
              </View>
              <View style={styles.docText}>
                <AppText variant="bodyMedium">{doc.titulo}</AppText>
                <MutedText style={[styles.docEstado, destacado && styles.docEstadoDestacado]}>
                  {destacado ? 'Curso gratis de 40 min · te da la insignia' : ESTADO_TEXTO[estado]}
                </MutedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.porque}>
        <AppText variant="label" style={styles.porqueLabel}>
          Por qué importa
        </AppText>
        <MutedText style={styles.porqueTexto}>
          Los paseadores con las 4 insignias reciben <AppText style={styles.porqueDestacado}>3× más pedidos</AppText>{' '}
          y pueden cobrar hasta 15% más por paseo.
        </MutedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 3,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 2,
    backgroundColor: colors.brandLightBg,
    borderRadius: radii.xl,
    padding: spacing.md + 4,
    marginBottom: spacing.lg,
  },
  resumenIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenText: {
    flex: 1,
  },
  resumenTitulo: {
    color: colors.brandDark,
    fontSize: 19,
  },
  resumenSubtitulo: {
    color: colors.brand700,
    fontSize: 12.5,
    marginTop: 2,
  },
  lista: {
    gap: spacing.sm + 2,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border300,
    borderRadius: radii.lg,
    padding: spacing.md - 2,
  },
  docCardDestacado: {
    borderWidth: 2,
    borderColor: colors.alert500,
  },
  docIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgNeutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docIconValidado: {
    backgroundColor: colors.brand200,
  },
  docText: {
    flex: 1,
  },
  docEstado: {
    fontSize: 11.5,
    marginTop: 1,
  },
  docEstadoDestacado: {
    color: colors.alertText,
  },
  porque: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.brand900,
    borderRadius: radii.xl - 2,
    padding: spacing.md + 2,
  },
  porqueLabel: {
    color: colors.brandCircleFaint,
    marginBottom: spacing.sm,
  },
  porqueTexto: {
    color: 'rgba(245,234,216,0.78)',
    fontSize: 13,
    lineHeight: 19,
  },
  porqueDestacado: {
    color: colors.onDark,
    fontWeight: '700',
  },
});
