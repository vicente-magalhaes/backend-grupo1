import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { reportsApi } from '../../api/endpoints';
import type { DashboardOut, InstructorSuggestion } from '../../api/types';
import {
  Avatar,
  Card,
  EmptyState,
  Loading,
  Muted,
  ProgressBar,
  Screen,
  Stars,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';

function Metric({ label, value }: { label: string; value?: number | null }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt variant="subhead">{label}</Txt>
        <Txt variant="subhead" color={theme.colors.accent}>
          {value?.toFixed(1) ?? '—'}
        </Txt>
      </View>
      <ProgressBar value={value ?? 0} max={10} />
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

  if (error)
    return (
      <Screen>
        <Toast message={error} />
      </Screen>
    );
  if (!data) return <Loading label="Carregando evolução..." />;

  return (
    <Screen>
      <Card>
        <Txt variant="title3">Sua evolução</Txt>
        {data.aulas_realizadas === 0 ? (
          <Muted>Você ainda não tem relatórios de aula.</Muted>
        ) : (
          <>
            <Metric label="Baliza" value={data.media_baliza} />
            <Metric label="Percurso" value={data.media_percurso} />
            <Metric label="Controle de embreagem" value={data.media_embreagem} />
            <View style={{ marginTop: theme.space.sm, gap: 2 }}>
              <Txt variant="body">
                Probabilidade estimada de aprovação:{' '}
                <Txt variant="headline" color={theme.colors.accent}>
                  {data.probabilidade_aprovacao}%
                </Txt>
              </Txt>
              <Muted>Ponto mais crítico: {data.ponto_mais_critico}</Muted>
            </View>
          </>
        )}
        <Muted>
          Aulas realizadas: {data.aulas_realizadas} · Faltam {data.aulas_faltantes} para o mínimo (
          {data.aulas_minimas}).
        </Muted>
      </Card>

      <Txt variant="title3">Sugestões da IA</Txt>
      {suggestions.length === 0 ? (
        <EmptyState icon="bulb-outline" text="Sem sugestões no momento." />
      ) : (
        suggestions.map((s) => (
          <Card key={s.instructor_id}>
            <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center' }}>
              <Avatar name={s.full_name} size={48} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="headline">{s.full_name}</Txt>
                <Stars value={s.avg_rating} />
                <Muted>{s.motivo}</Muted>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
