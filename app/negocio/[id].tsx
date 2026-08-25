import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';

export default function PerfilPublicoEmpresaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      etapa="Etapa 5"
      titulo="Perfil público de empresa"
      descripcion={`Ficha pública del negocio ${id}. El CTA cambia entre "Reservar turno" y "Llamar para reservar" según turnos_habilitado.`}
    />
  );
}
