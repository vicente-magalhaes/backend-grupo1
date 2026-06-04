import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import {
  Card,
  EmptyState,
  Loading,
  Muted,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { theme } from '../../theme';
import { formatDateTime } from '../../utils/format';

export function ReportsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      bookingsApi
        .myInstructor()
        .then((list) =>
          setItems(
            list.filter((b) => b.status === 'confirmed' || b.status === 'completed'),
          ),
        )
        .catch((e) => setError(apiErrorMessage(e)));
    }, []),
  );

  if (error) return <Screen><Muted>{error}</Muted></Screen>;
  if (items === null) return <Loading />;

  return (
    <Screen>
      <Muted>Avalie o desempenho do aluno após cada aula (REQ08).</Muted>
      {items.length === 0 ? <EmptyState text="Nenhuma aula confirmada para avaliar." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700' }}>{formatDateTime(b.start_at)}</Text>
          </View>
          {b.status === 'completed' ? (
            <Text style={{ color: theme.colors.success }}>✓ Relatório registrado</Text>
          ) : (
            <PrimaryButton
              title="Avaliar aula"
              onPress={() => nav.navigate('CreateReport', { bookingId: b.id })}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}
