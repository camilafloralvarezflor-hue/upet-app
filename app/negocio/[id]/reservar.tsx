import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { PlaceholderScreen } from '../../../src/components/PlaceholderScreen';
import { MutedText } from '../../../src/components/Typography';

export default function ReservarTurnoScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      etapa="Etapa 8"
      titulo="Reservar turno"
      descripcion="La agenda de turnos online todavía no está construida. Vas a poder elegir día y horario acá."
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <MutedText>‹ Volver</MutedText>
      </Pressable>
    </PlaceholderScreen>
  );
}
