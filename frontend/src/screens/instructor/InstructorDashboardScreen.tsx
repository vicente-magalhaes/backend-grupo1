import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, reportsApi } from '../../api/endpoints';
import type { DashboardOut } from '../../api/types';
import { Card, Chip, EmptyState, Muted, ProgressBar, Screen, Toast, Txt } from '../../components';
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
      <Txt variant="title2">Evolução dos alunos</Txt>
      <Muted>Selecione um aluno com quem você tem aula confirmada (REQ05).</Muted>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
        {studentIds.map((id, i) => (
          <Chip key={id} label={`Aluno ${i + 1}`} selected={selected === id} onPress={() => loadDashboard(id)} />
        ))}
      </View>

      {studentIds.length === 0 ? (
        <EmptyState icon="people-outline" text="Você ainda não tem alunos confirmados." />
      ) : null}
      {error ? <Toast message={error} /> : null}

      {dashboard ? (
        <Card>
          {dashboard.aulas_realizadas === 0 ? (
            <Muted>Este aluno ainda não tem relatórios.</Muted>
          ) : (
            <>
              <Metric label="Baliza" value={dashboard.media_baliza} />
              <Metric label="Percurso" value={dashboard.media_percurso} />
              <Metric label="Controle de embreagem" value={dashboard.media_embreagem} />
              <View style={{ marginTop: theme.space.sm }}>
                <Txt variant="body">
                  Probabilidade de aprovação:{' '}
                  <Txt variant="headline" color={theme.colors.accent}>
                    {dashboard.probabilidade_aprovacao}%
                  </Txt>
                </Txt>
                <Muted>Ponto mais crítico: {dashboard.ponto_mais_critico}</Muted>
              </View>
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
