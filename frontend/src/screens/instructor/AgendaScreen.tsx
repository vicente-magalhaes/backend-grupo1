import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import { Card, EmptyState, Icon, Loading, Muted, Screen, StatusBadge, Toast, Txt } from '../../components';
import { theme } from '../../theme';
import { formatDateTime } from '../../utils/format';

export function AgendaScreen() {
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      bookingsApi
        .myInstructor()
        .then((list) => setItems([...list].sort((a, b) => (a.start_at ?? '').localeCompare(b.start_at ?? ''))))
        .catch((e) => setError(apiErrorMessage(e)));
    }, []),
  );

  if (error)
    return (
      <Screen>
        <Toast message={error} />
      </Screen>
    );
  if (items === null) return <Loading label="Carregando agenda..." />;

  return (
    <Screen>
      <Muted>Sua agenda de aulas em ordem cronológica.</Muted>
      {items.length === 0 ? <EmptyState icon="calendar-outline" text="Nenhuma aula na agenda." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: theme.radii.tile,
                backgroundColor: theme.colors.tileBlue,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="calendar" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="headline">{formatDateTime(b.start_at)}</Txt>
              <Muted>
                {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo do aluno'}
                {b.meeting_address ? ` · ${b.meeting_address}` : ''}
              </Muted>
            </View>
            <StatusBadge status={b.status} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}
