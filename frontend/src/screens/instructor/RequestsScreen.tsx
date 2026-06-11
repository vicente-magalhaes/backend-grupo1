import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import {
  Button,
  Card,
  EmptyState,
  Loading,
  Muted,
  Screen,
  StatusBadge,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';
import { formatDateTime, money } from '../../utils/format';

export function RequestsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await bookingsApi.myInstructor());
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function accept(id: string) {
    try {
      await bookingsApi.accept(id);
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  async function confirmReject(id: string) {
    try {
      await bookingsApi.reject(id, reason || 'Imprevisto pessoal');
      setRejectingId(null);
      setReason('');
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  if (items === null) return <Loading label="Carregando solicitações..." />;

  return (
    <Screen>
      {error ? <Toast message={error} tone="info" /> : null}
      {items.length === 0 ? <EmptyState icon="mail-outline" text="Nenhuma solicitação no momento." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="headline">{formatDateTime(b.start_at)}</Txt>
            <StatusBadge status={b.status} />
          </View>
          <Muted>
            {money(b.price)} ·{' '}
            {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo do aluno'}
          </Muted>
          <Muted>Endereço: {b.meeting_address ?? '(revelado somente após a confirmação — REQ07)'}</Muted>

          {b.status === 'awaiting_confirmation' ? (
            <View style={{ gap: theme.space.sm, marginTop: theme.space.xs }}>
              <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
                <View style={{ flex: 1 }}>
                  <Button title="Aceitar" icon="checkmark" size="sm" onPress={() => accept(b.id)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Recusar" variant="danger-outline" size="sm" onPress={() => setRejectingId(b.id)} />
                </View>
              </View>
              {rejectingId === b.id ? (
                <View style={{ gap: theme.space.sm }}>
                  <TextField
                    label="Motivo da recusa"
                    value={reason}
                    onChangeText={setReason}
                    placeholder="Imprevisto pessoal"
                  />
                  <Button title="Confirmar recusa" variant="danger" size="sm" onPress={() => confirmReject(b.id)} />
                </View>
              ) : null}
            </View>
          ) : null}

          <Button
            title="Abrir chat"
            icon="chatbubble-outline"
            variant="outline"
            size="sm"
            onPress={() => nav.navigate('Chat', { bookingId: b.id })}
          />
        </Card>
      ))}
    </Screen>
  );
}
