import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import type { BookingOut } from '../../api/types';
import {
  Card,
  EmptyState,
  Field,
  Loading,
  Muted,
  OutlineButton,
  PrimaryButton,
  Screen,
  StatusBadge,
} from '../../components/ui';
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

  if (items === null) return <Loading />;

  return (
    <Screen>
      {error ? <Muted>{error}</Muted> : null}
      {items.length === 0 ? <EmptyState text="Nenhuma solicitação no momento." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700' }}>{formatDateTime(b.start_at)}</Text>
            <StatusBadge status={b.status} />
          </View>
          <Muted>
            {money(b.price)} ·{' '}
            {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo do aluno'}
          </Muted>
          <Muted>
            Endereço:{' '}
            {b.meeting_address ?? '(revelado somente após a confirmação — REQ07)'}
          </Muted>

          {b.status === 'awaiting_confirmation' ? (
            <View style={{ gap: 8, marginTop: 4 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Aceitar" onPress={() => accept(b.id)} />
                </View>
                <View style={{ flex: 1 }}>
                  <OutlineButton title="Recusar" onPress={() => setRejectingId(b.id)} tone="danger" />
                </View>
              </View>
              {rejectingId === b.id ? (
                <View style={{ gap: 8 }}>
                  <Field label="Motivo da recusa" value={reason} onChangeText={setReason} placeholder="Imprevisto pessoal" />
                  <OutlineButton title="Confirmar recusa" onPress={() => confirmReject(b.id)} tone="danger" />
                </View>
              ) : null}
            </View>
          ) : null}

          <OutlineButton title="Abrir chat" onPress={() => nav.navigate('Chat', { bookingId: b.id })} />
        </Card>
      ))}
    </Screen>
  );
}
