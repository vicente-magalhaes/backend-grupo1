import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, paymentsApi } from '../../api/endpoints';
import type { BookingOut, RefundPolicyOut } from '../../api/types';
import { Button, Card, EmptyState, Loading, Muted, Screen, StatusBadge, Toast, Txt } from '../../components';
import { theme } from '../../theme';
import { formatDateTime, money } from '../../utils/format';

export function BookingsScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<BookingOut[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [policy, setPolicy] = useState<Record<string, RefundPolicyOut>>({});

  const load = useCallback(async () => {
    try {
      setItems(await bookingsApi.myStudent());
    } catch (e) {
      setMessage(apiErrorMessage(e));
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
      setMessage(`Aula cancelada. Reembolso de ${r.refund_percentage}% (${money(r.refund_amount)}).`);
      load();
    } catch (e) {
      setMessage(apiErrorMessage(e));
    }
  }

  async function showPolicy(id: string) {
    try {
      const p = await bookingsApi.refundPolicy(id);
      setPolicy((prev) => ({ ...prev, [id]: p }));
    } catch (e) {
      setMessage(apiErrorMessage(e));
    }
  }

  if (items === null) return <Loading label="Carregando agendamentos..." />;

  return (
    <Screen>
      {message ? <Toast message={message} tone="info" /> : null}
      {items.length === 0 ? (
        <EmptyState icon="calendar-outline" text="Você ainda não tem agendamentos." />
      ) : null}
      {items.map((b) => (
        <Card key={b.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt variant="headline">{formatDateTime(b.start_at)}</Txt>
            <StatusBadge status={b.status} />
          </View>
          <Muted>
            {money(b.price)} ·{' '}
            {b.vehicle_modality === 'instructor' ? 'Veículo do instrutor' : 'Veículo próprio'}
          </Muted>
          <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap', marginTop: theme.space.xs }}>
            <View style={{ flexGrow: 1, flexBasis: 120 }}>
              <Button
                title="Abrir chat"
                icon="chatbubble-outline"
                variant="outline"
                size="sm"
                onPress={() => nav.navigate('Chat', { bookingId: b.id })}
              />
            </View>
            {b.status === 'awaiting_confirmation' || b.status === 'confirmed' ? (
              <>
                <View style={{ flexGrow: 1, flexBasis: 120 }}>
                  <Button title="Reembolso?" variant="ghost" size="sm" onPress={() => showPolicy(b.id)} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 120 }}>
                  <Button title="Cancelar" variant="danger-outline" size="sm" onPress={() => cancel(b.id)} />
                </View>
              </>
            ) : null}
          </View>
          {policy[b.id] ? (
            <View style={{ marginTop: theme.space.sm, gap: 2 }}>
              <Txt variant="subhead">Política de reembolso:</Txt>
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
