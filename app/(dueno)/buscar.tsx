import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { BusinessCard } from '../../src/components/BusinessCard';
import { Icon } from '../../src/components/Icon';
import { RubroFilterChips } from '../../src/components/RubroFilterChips';
import { Screen } from '../../src/components/Screen';
import { AppText, Heading1, MutedText } from '../../src/components/Typography';
import { useBusinesses } from '../../src/hooks/useBusinesses';
import { useReviewStatsMap } from '../../src/hooks/useReviews';
import { useUserLocation } from '../../src/hooks/useUserLocation';
import { colors, fonts, radii, spacing } from '../../src/theme/tokens';
import { distanciaKm } from '../../src/lib/geo';
import { RUBROS_ACTIVOS } from '../../src/lib/business-rubros';

const RUBROS_ACTIVOS_VALORES = new Set(RUBROS_ACTIVOS.map((r) => r.value));

export default function BuscarCercaScreen() {
  const router = useRouter();
  const { coords, status, retry } = useUserLocation();
  const { data: businesses, isLoading } = useBusinesses();
  const { data: reviewStats } = useReviewStatsMap();
  const [query, setQuery] = useState('');
  const [rubro, setRubro] = useState<string | null>(null);
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [vista, setVista] = useState<'lista' | 'mapa'>('lista');

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
      .filter((b) => RUBROS_ACTIVOS_VALORES.has(b.rubro))
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
      {ciudad && (
        <View style={styles.ubicacionRow}>
          <Icon name="locationPin" size={15} color={colors.primary} strokeWidth={2} />
          <MutedText style={styles.ubicacionText}>{ciudad}</MutedText>
          <Icon name="chevronDown" size={13} color={colors.textFaint} strokeWidth={2} />
        </View>
      )}
      {status === 'denied' && (
        <MutedText style={styles.ubicacion}>
          Activá la ubicación para ver la distancia a cada negocio.{' '}
          <MutedText style={styles.retry} onPress={retry}>
            Reintentar
          </MutedText>
        </MutedText>
      )}

      <Heading1 style={styles.title}>Cerca tuyo</Heading1>

      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={colors.textFaint} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar paseadores, cuidadores…"
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
        />
      </View>

      <RubroFilterChips value={rubro} onChange={setRubro} />

      {isLoading || status === 'loading' ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.resultsRow}>
            <MutedText style={styles.count}>
              <AppText variant="bodyMedium" style={styles.countNumber}>
                {resultados.length}
              </AppText>{' '}
              resultados
            </MutedText>
            <View style={styles.toggle}>
              <Pressable
                onPress={() => setVista('lista')}
                style={[styles.toggleOption, vista === 'lista' && styles.toggleOptionActive]}
              >
                <AppText
                  variant={vista === 'lista' ? 'bodyMedium' : 'bodyMuted'}
                  style={[styles.toggleText, vista === 'lista' && styles.toggleTextActive]}
                >
                  Lista
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => setVista('mapa')}
                style={[styles.toggleOption, vista === 'mapa' && styles.toggleOptionActive]}
              >
                <AppText
                  variant={vista === 'mapa' ? 'bodyMedium' : 'bodyMuted'}
                  style={[styles.toggleText, vista === 'mapa' && styles.toggleTextActive]}
                >
                  Mapa
                </AppText>
              </Pressable>
            </View>
          </View>

          {vista === 'lista' ? (
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
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords?.lat ?? resultados[0]?.business.lat ?? -31.42,
                longitude: coords?.lng ?? resultados[0]?.business.lng ?? -64.5,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {resultados
                .filter((item) => item.business.lat != null && item.business.lng != null)
                .map((item) => (
                  <Marker
                    key={item.business.id}
                    coordinate={{ latitude: item.business.lat!, longitude: item.business.lng! }}
                    title={item.business.nombre}
                    onPress={() => router.push(`/negocio/${item.business.id}`)}
                  />
                ))}
            </MapView>
          )}
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
  ubicacionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  ubicacionText: {
    fontSize: 12.5,
  },
  retry: {
    color: colors.primary,
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDark,
  },
  loading: {
    marginTop: spacing.xl,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  count: {
    fontSize: 13,
  },
  countNumber: {
    color: colors.textDark,
    fontSize: 13,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#EEE7DB',
    borderRadius: 10,
    padding: 3,
  },
  toggleOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: colors.white,
    shadowColor: 'rgba(32,30,29,0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    color: colors.textFaint,
  },
  toggleTextActive: {
    color: colors.textDark,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  map: {
    flex: 1,
    borderRadius: radii.lg,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
