import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, instructorsApi } from '../../api/endpoints';
import type { InstructorCard, SlotOut } from '../../api/types';
import { Card, EmptyState, H1, Loading, Muted, Screen, Stars } from '../../components/ui';
import { theme } from '../../theme';
import { formatDateTime, money } from '../../utils/format';

export function InstructorDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { instructorId } = route.params;
  const [card, setCard] = useState<InstructorCard | null>(null);
  const [slots, setSlots] = useState<SlotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([
          instructorsApi.get(instructorId),
          bookingsApi.availability(instructorId),
        ]);
        setCard(c);
        setSlots(s);
      } catch (e) {
        setError(apiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [instructorId]);

  if (loading) return <Loading />;
  if (error || !card) return <Screen><Text style={{ color: theme.colors.danger }}>{error}</Text></Screen>;

  return (
    <Screen>
      <Card>
        <H1>{card.full_name}</H1>
        <Stars value={card.avg_rating} />
        <Muted>
          {card.region} · Categorias {card.categories.join('/')} · {money(card.price)}/aula
        </Muted>
        <Muted>
          {card.total_lessons} aula(s) concluída(s) ·{' '}
          {card.provides_vehicle ? 'Possui veículo próprio' : 'Não fornece veículo'}
        </Muted>
        {card.teaching_method ? <Text style={{ marginTop: 8 }}>{card.teaching_method}</Text> : null}
      </Card>

      <Text style={{ fontWeight: '700', fontSize: 16, color: theme.colors.text }}>
        Horários disponíveis
      </Text>
      <Muted>Só aparecem aulas com início em pelo menos 8 dias (REQ03).</Muted>

      {slots.length === 0 ? (
        <EmptyState text="Sem horários disponíveis no momento." />
      ) : (
        slots.map((s) => (
          <Pressable
            key={s.id}
            onPress={() =>
              nav.navigate('Payment', {
                slotId: s.id,
                price: card.price,
                instructorName: card.full_name,
              })
            }
          >
            <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{formatDateTime(s.start_at)}</Text>
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Solicitar →</Text>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
