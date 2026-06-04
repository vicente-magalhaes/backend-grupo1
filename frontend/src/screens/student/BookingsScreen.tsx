import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, paymentsApi } from '../../api/endpoints';
import type { BookingOut, RefundPolicyOut } from '../../api/types';
import {
  Card,
  EmptyState,
  Loading,
  Muted,
  OutlineButton,
  Screen,
  StatusBadge,
} from '../../components/ui';
import { theme } from '../../theme';
import { formatDateTime, money } from '../../utils/format';

export function BookingsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<Record<string, RefundPolicyOut>>({});

  const load = useCallback(async () => {
    try {
      setItems(await bookingsApi.myStudent());
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function cancel(id: string) {
    try {
      const r = await paymentsApi.cancel(id);
      setError(`Aula cancelada. Reembolso de ${r.refund_percentage}% (${money(r.refund_amount)}).`);
      load();
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  async function showPolicy(id: string) {
    try {
      const p = await bookingsApi.refundPolicy(id);
      setPolicy((prev) => ({ ...prev, [id]: p }));
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  }

  if (items === null) return <Loading />;

  return (
    <Screen>
      {error ? <Muted>{error}</Muted> : null}
      {items.length === 0 ? <EmptyState text="Você ainda não tem agendamentos." /> : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700' }}>{formatDateTime(b.start_at)}</Text>
            <StatusBadge status={b.status} />
          </View>
          <Muted>
            {money(b.price)} ·{' '}
            {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo próprio'}
          </Muted>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <OutlineButton title="Abrir chat" onPress={() => nav.navigate('Chat', { bookingId: b.id })} />
            </View>
            {b.status === 'awaiting_confirmation' || b.status === 'confirmed' ? (
              <>
                <View style={{ flex: 1, minWidth: 120 }}>
                  <OutlineButton title="Reembolso?" onPress={() => showPolicy(b.id)} />
                </View>
                <View style={{ flex: 1, minWidth: 120 }}>
                  <OutlineButton title="Cancelar" onPress={() => cancel(b.id)} tone="danger" />
                </View>
              </>
            ) : null}
          </View>
          {policy[b.id] ? (
            <View style={{ marginTop: 8, gap: 2 }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>Política de reembolso:</Text>
              {policy[b.id].windows.map((w) => (
                <Muted key={w.percentage}>
                  {w.percentage}% até {formatDateTime(w.until)}
                </Muted>
              ))}
            </View>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
