import { PlaceholderScreen } from '../../src/components/PlaceholderScreen';
import { SignOutButton } from '../../src/components/SignOutButton';

export default function PerfilMascotaScreen() {
  return (
    <PlaceholderScreen
      etapa="Etapa 3"
      titulo="Perfil de mascota"
      descripcion="Acá va el CRUD de mascotas y el carnet de vacunas."
    >
      <SignOutButton />
    </PlaceholderScreen>
  );
}
