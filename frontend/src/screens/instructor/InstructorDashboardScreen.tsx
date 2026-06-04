import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, reportsApi } from '../../api/endpoints';
import type { DashboardOut } from '../../api/types';
import { Card, EmptyState, H1, Muted, Screen } from '../../components/ui';
import { theme } from '../../theme';

function Bar({ label, value }: { label: string; value?: number | null }) {
  const pct = Math.max(0, Math.min(100, ((value ?? 0) / 10) * 100));
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>{label}</Text>
        <Text style={{ fontWeight: '700', color: theme.colors.primaryDark }}>
          {value?.toFixed(1) ?? '—'}
        </Text>
      </View>
      <View style={{ height: 10, backgroundColor: theme.colors.primaryLight, borderRadius: 6 }}>
        <View style={{ height: 10, width: `${pct}%`, backgroundColor: theme.colors.primary, borderRadius: 6 }} />
      </View>
    </View>
  );
}

export function InstructorDashboardScreen() {
  const params = useRoute<any>().params as { studentId?: string } | undefined;
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(params?.studentId ?? null);
  const [dashboard, setDashboard] = useState<DashboardOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      bookingsApi
        .myInstructor()
        .then((list) => {
          const ids = Array.from(
            new Set(
              list
                .filter((b) => b.status === 'confirmed' || b.status === 'completed')
                .map((b) => b.student_id),
            ),
          );
          setStudentIds(ids);
          if (params?.studentId) loadDashboard(params.studentId);
        })
        .catch((e) => setError(apiErrorMessage(e)));
    }, []),
  );

  async function loadDashboard(studentId: string) {
    setSelected(studentId);
    try {
      setDashboard(await reportsApi.instructorDashboard(studentId));
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  return (
    <Screen>
      <H1>Evolução dos alunos</H1>
      <Muted>Selecione um aluno com quem você tem aula confirmada (REQ05).</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {studentIds.map((id, i) => (
          <Pressable
            key={id}
            onPress={() => loadDashboard(id)}
            style={{
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: selected === id ? theme.colors.primary : theme.colors.primaryLight,
            }}
          >
            <Text style={{ color: selected === id ? '#fff' : theme.colors.primaryDark, fontWeight: '600' }}>
              Aluno {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      {studentIds.length === 0 ? <EmptyState text="Você ainda não tem alunos confirmados." /> : null}
      {error ? <Muted>{error}</Muted> : null}

      {dashboard ? (
        <Card>
          {dashboard.aulas_realizadas === 0 ? (
            <Muted>Este aluno ainda não tem relatórios.</Muted>
          ) : (
            <>
              <Bar label="Baliza" value={dashboard.media_baliza} />
              <Bar label="Percurso" value={dashboard.media_percurso} />
              <Bar label="Controle de embreagem" value={dashboard.media_embreagem} />
              <Text style={{ marginTop: 8 }}>
                Probabilidade de aprovação:{' '}
                <Text style={{ fontWeight: '800', color: theme.colors.primaryDark }}>
                  {dashboard.probabilidade_aprovacao}%
                </Text>
              </Text>
              <Muted>Ponto mais crítico: {dashboard.ponto_mais_critico}</Muted>
            </>
          )}
          <Muted>
            Aulas: {dashboard.aulas_realizadas} · faltam {dashboard.aulas_faltantes}
          </Muted>
        </Card>
      ) : null}
    </Screen>
  );
}
