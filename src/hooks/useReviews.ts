import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { Review } from '../lib/database.types';

export type ReviewWithAutor = Review & { profiles: { nombre: string } | null };

async function fetchReviews(businessId: string): Promise<ReviewWithAutor[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(nombre)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as ReviewWithAutor[];
}

export function useReviews(businessId: string | undefined) {
  const query = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: () => fetchReviews(businessId as string),
    enabled: !!businessId,
  });

  const stats = useMemo(() => {
    const reviews = query.data ?? [];
    if (reviews.length === 0) return { promedio: 0, total: 0 };
    const suma = reviews.reduce((acc, r) => acc + r.calificacion, 0);
    return { promedio: suma / reviews.length, total: reviews.length };
  }, [query.data]);

  return { ...query, stats };
}

export interface ReviewStats {
  promedio: number;
  total: number;
}

async function fetchReviewStatsMap(): Promise<Map<string, ReviewStats>> {
  const { data, error } = await supabase.from('reviews').select('business_id, calificacion');
  if (error) throw error;

  const acumulado = new Map<string, { suma: number; total: number }>();
  for (const { business_id, calificacion } of data) {
    const actual = acumulado.get(business_id) ?? { suma: 0, total: 0 };
    acumulado.set(business_id, { suma: actual.suma + calificacion, total: actual.total + 1 });
  }

  const stats = new Map<string, ReviewStats>();
  for (const [businessId, { suma, total }] of acumulado) {
    stats.set(businessId, { promedio: suma / total, total });
  }
  return stats;
}

export function useReviewStatsMap() {
  return useQuery({
    queryKey: ['reviews', 'stats-map'],
    queryFn: fetchReviewStatsMap,
  });
}
