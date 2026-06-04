import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import { Card, EmptyState, Loading, Muted, Screen, StatusBadge } from '../../components/ui';
import { formatDateTime } from '../../utils/format';

export function AgendaScreen() {
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      bookingsApi
        .myInstructor()
        .then((list) =>
          setItems(
            [...list].sort((a, b) => (a.start_at ?? '').localeCompare(b.start_at ?? '')),
          ),
        )
        .catch((e) => setError(apiErrorMessage(e)));
    }, []),
  );

  if (error) return <Screen><Muted>{error}</Muted></Screen>;
  if (items === null) return <Loading />;

  return (
    <Screen>
      <Muted>Sua agenda de aulas em ordem cronológica.</Muted>
      {items.length === 0 ? <EmptyState text="Nenhuma aula na agenda." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700' }}>{formatDateTime(b.start_at)}</Text>
            <StatusBadge status={b.status} />
          </View>
          <Muted>
            {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo do aluno'}
          </Muted>
          {b.meeting_address ? <Muted>Local: {b.meeting_address}</Muted> : null}
        </Card>
      ))}
    </Screen>
  );
}
