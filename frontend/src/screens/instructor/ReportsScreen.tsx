import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import { Button, Card, EmptyState, Icon, Loading, Muted, Screen, Toast, Txt } from '../../components';
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
        .then((list) => setItems(list.filter((b) => b.status === 'confirmed' || b.status === 'completed')))
        .catch((e) => setError(apiErrorMessage(e)));
    }, []),
  );

  if (error)
    return (
      <Screen>
        <Toast message={error} />
      </Screen>
    );
  if (items === null) return <Loading label="Carregando aulas..." />;

  return (
    <Screen>
      <Muted>Avalie o desempenho do aluno após cada aula (REQ08).</Muted>
      {items.length === 0 ? (
        <EmptyState icon="document-text-outline" text="Nenhuma aula confirmada para avaliar." />
      ) : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="headline">{formatDateTime(b.start_at)}</Txt>
            {b.status === 'completed' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="checkmark-circle" size={18} color={theme.colors.success} />
                <Txt variant="subhead" color={theme.colors.success}>
                  Registrado
                </Txt>
              </View>
            ) : null}
          </View>
          {b.status !== 'completed' ? (
            <Button
              title="Avaliar aula"
              icon="create-outline"
              onPress={() => nav.navigate('CreateReport', { bookingId: b.id })}
            />
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
