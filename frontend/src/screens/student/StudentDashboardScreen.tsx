import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { reportsApi } from '../../api/endpoints';
import type { DashboardOut, InstructorSuggestion } from '../../api/types';
import { Card, EmptyState, H1, Loading, Muted, Screen, Stars } from '../../components/ui';
import { theme } from '../../theme';

function Bar({ label, value }: { label: string; value?: number | null }) {
  const pct = Math.max(0, Math.min(100, ((value ?? 0) / 10) * 100));
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.text }}>{label}</Text>
        <Text style={{ fontWeight: '700', color: theme.colors.primaryDark }}>
          {value?.toFixed(1) ?? '—'}
        </Text>
      </View>
      <View style={{ height: 10, backgroundColor: theme.colors.primaryLight, borderRadius: 6 }}>
        <View
          style={{ height: 10, width: `${pct}%`, backgroundColor: theme.colors.primary, borderRadius: 6 }}
        />
      </View>
    </View>
  );
}

export function StudentDashboardScreen() {
  const [data, setData] = useState<DashboardOut | null>(null);
  const [suggestions, setSuggestions] = useState<InstructorSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const [d, s] = await Promise.all([reportsApi.dashboard(), reportsApi.suggestions()]);
          setData(d);
          setSuggestions(s);
        } catch (e) {
          setError(apiErrorMessage(e));
        }
      })();
    }, []),
  );

  if (error) return <Screen><Muted>{error}</Muted></Screen>;
  if (!data) return <Loading />;

  return (
    <Screen>
      <Card>
        <H1>Sua evolução</H1>
        {data.aulas_realizadas === 0 ? (
          <Muted>Você ainda não tem relatórios de aula.</Muted>
        ) : (
          <>
            <Bar label="Baliza" value={data.media_baliza} />
            <Bar label="Percurso" value={data.media_percurso} />
            <Bar label="Controle de embreagem" value={data.media_embreagem} />
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 16 }}>
                Probabilidade estimada de aprovação:{' '}
                <Text style={{ fontWeight: '800', color: theme.colors.primaryDark }}>
                  {data.probabilidade_aprovacao}%
                </Text>
              </Text>
              <Muted>Ponto mais crítico: {data.ponto_mais_critico}</Muted>
            </View>
          </>
        )}
        <Muted>
          Aulas realizadas: {data.aulas_realizadas} · Faltam {data.aulas_faltantes} para o mínimo (
          {data.aulas_minimas}).
        </Muted>
      </Card>

      <Text style={{ fontWeight: '700', fontSize: 16, color: theme.colors.text }}>
        Sugestões da IA
      </Text>
      {suggestions.length === 0 ? (
        <EmptyState text="Sem sugestões no momento." />
      ) : (
        suggestions.map((s) => (
          <Card key={s.instructor_id}>
            <Text style={{ fontWeight: '700' }}>{s.full_name}</Text>
            <Stars value={s.avg_rating} />
            <Muted>{s.motivo}</Muted>
          </Card>
        ))
      )}
    </Screen>
  );
}
