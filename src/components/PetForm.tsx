import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { Button } from './Button';
import { TextField } from './TextField';
import { MutedText } from './Typography';
import { colors, spacing } from '../theme/tokens';
import type { PetInput } from '../hooks/usePets';

interface PetFormProps {
  initialValues?: Partial<PetInput> & { foto_url?: string | null };
  submitLabel: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: PetInput, localImageUri: string | null) => void;
}

export function PetForm({ initialValues, submitLabel, loading, error, onSubmit }: PetFormProps) {
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [especie, setEspecie] = useState(initialValues?.especie ?? '');
  const [raza, setRaza] = useState(initialValues?.raza ?? '');
  const [edad, setEdad] = useState(initialValues?.edad?.toString() ?? '');
  const [peso, setPeso] = useState(initialValues?.peso?.toString() ?? '');
  const [condicionesMedicas, setCondicionesMedicas] = useState(
    initialValues?.condiciones_medicas ?? ''
  );
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const puedeEnviar = nombre.trim().length > 0 && especie.trim().length > 0;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!puedeEnviar || loading) return;
    onSubmit(
      {
        nombre: nombre.trim(),
        especie: especie.trim(),
        raza: raza.trim() || null,
        edad: edad ? Number(edad) : null,
        peso: peso ? Number(peso) : null,
        foto_url: initialValues?.foto_url ?? null,
        condiciones_medicas: condicionesMedicas.trim() || null,
      },
      localImageUri
    );
  };

  const previewUri = localImageUri ?? initialValues?.foto_url ?? null;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={pickImage} style={styles.photoPicker}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MutedText>Agregar foto</MutedText>
          </View>
        )}
      </Pressable>

      <View style={styles.form}>
        <TextField label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Firulais" />
        <TextField
          label="Especie"
          value={especie}
          onChangeText={setEspecie}
          placeholder="Perro, gato…"
        />
        <TextField
          label="Raza (opcional)"
          value={raza}
          onChangeText={setRaza}
          placeholder="Golden Retriever"
        />
        <TextField
          label="Edad en años (opcional)"
          value={edad}
          onChangeText={setEdad}
          placeholder="3"
          keyboardType="numeric"
        />
        <TextField
          label="Peso en kg (opcional)"
          value={peso}
          onChangeText={setPeso}
          placeholder="28"
          keyboardType="numeric"
        />
        <TextField
          label="Condiciones médicas (opcional)"
          value={condicionesMedicas}
          onChangeText={setCondicionesMedicas}
          placeholder="Alergias, tratamientos…"
          multiline
        />
      </View>

      {error && <MutedText style={styles.error}>{error}</MutedText>}

      <Button
        label={loading ? 'Guardando…' : submitLabel}
        onPress={handleSubmit}
        disabled={!puedeEnviar || loading}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  photoPicker: {
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
