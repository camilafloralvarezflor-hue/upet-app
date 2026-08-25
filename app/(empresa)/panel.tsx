import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';
import { SignOutButton } from '../../src/components/SignOutButton';

export default function PanelEmpresaScreen() {
  return (
    <PlaceholderScreen
      etapa="Etapa 8"
      titulo="Panel de la empresa"
      descripcion="Acá van las estadísticas y la tarjeta de destacado (boost)."
    >
      <SignOutButton />
    </PlaceholderScreen>
  );
}
