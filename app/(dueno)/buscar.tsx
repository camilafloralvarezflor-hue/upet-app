import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { BusinessCard } from '../../src/components/BusinessCard';
import { RubroFilterChips } from '../../src/components/RubroFilterChips';
import { Screen } from '../../src/components/Screen';
import { Heading1, MutedText } from '../../src/components/Typography';
import { useBusinesses } from '../../src/hooks/useBusinesses';
import { useReviewStatsMap } from '../../src/hooks/useReviews';
import { useUserLocation } from '../../src/hooks/useUserLocation';
import { colors, fonts, radii, spacing } from '../../src/theme/tokens';
import { distanciaKm } from '../../src/lib/geo';

export default function BuscarCercaScreen() {
  const router = useRouter();
  const { coords, status, retry } = useUserLocation();
  const { data: businesses, isLoading } = useBusinesses();
  const { data: reviewStats } = useReviewStatsMap();
  const [query, setQuery] = useState('');
  const [rubro, setRubro] = useState<string | null>(null);
  const [ciudad, setCiudad] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;
    Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng })
      .then(([place]) => {
        if (place) setCiudad([place.city, place.region].filter(Boolean).join(', '));
      })
      .catch(() => {});
  }, [coords]);

  const resultados = useMemo(() => {
    if (!businesses) return [];

    return businesses
      .filter((b) => (rubro ? b.rubro === rubro : true))
      .filter((b) => b.nombre.toLowerCase().includes(query.trim().toLowerCase()))
      .map((b) => ({
        business: b,
        distancia:
          coords && b.lat != null && b.lng != null
            ? distanciaKm(coords.lat, coords.lng, b.lat, b.lng)
            : null,
      }))
      .sort((a, b) => {
        if (a.distancia == null) return 1;
        if (b.distancia == null) return -1;
        return a.distancia - b.distancia;
      });
  }, [businesses, rubro, query, coords]);

  return (
    <Screen>
      {ciudad && <MutedText style={styles.ubicacion}>📍 {ciudad}</MutedText>}
      {status === 'denied' && (
        <MutedText style={styles.ubicacion}>
          Activá la ubicación para ver la distancia a cada negocio.{' '}
          <MutedText style={styles.retry} onPress={retry}>
            Reintentar
          </MutedText>
        </MutedText>
      )}

      <Heading1 style={styles.title}>Cerca tuyo</Heading1>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar veterinarias, paseadores…"
        placeholderTextColor={colors.textFaint}
        style={styles.searchBar}
      />

      <RubroFilterChips value={rubro} onChange={setRubro} />

      {isLoading || status === 'loading' ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <MutedText style={styles.count}>{resultados.length} resultados</MutedText>
          <FlatList
            data={resultados}
            keyExtractor={(item) => item.business.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <BusinessCard
                business={item.business}
                distanciaKm={item.distancia}
                ratingPromedio={reviewStats?.get(item.business.id)?.promedio ?? 0}
                ratingTotal={reviewStats?.get(item.business.id)?.total ?? 0}
                onPress={() => router.push(`/negocio/${item.business.id}`)}
              />
            )}
            ListEmptyComponent={
              <MutedText style={styles.empty}>
                No encontramos negocios para esta búsqueda.
              </MutedText>
            }
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ubicacion: {
    fontSize: 13,
    marginTop: spacing.md,
  },
  retry: {
    color: colors.primary,
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  loading: {
    marginTop: spacing.xl,
  },
  count: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
