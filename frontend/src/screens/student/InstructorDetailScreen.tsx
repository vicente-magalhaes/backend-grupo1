import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi, instructorsApi } from '../../api/endpoints';
import type { InstructorCard, SlotOut } from '../../api/types';
import {
  Avatar,
  Card,
  EmptyState,
  Icon,
  Loading,
  Muted,
  Pill,
  Screen,
  Stars,
  Toast,
  Txt,
} from '../../components';
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

  if (loading) return <Loading label="Carregando instrutor..." />;
  if (error || !card)
    return (
      <Screen>
        <Toast message={error ?? 'Não foi possível carregar o instrutor.'} />
      </Screen>
    );

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center' }}>
          <Avatar name={card.full_name} size={64} />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt variant="title3">{card.full_name}</Txt>
            <Stars value={card.avg_rating} />
            <Muted>
              {card.region} · Cat. {card.categories.join('/')}
            </Muted>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap', marginTop: theme.space.sm }}>
          <Pill label={`${money(card.price)}/aula`} icon="cash-outline" />
          <Pill label={`${card.total_lessons} aula(s)`} color={theme.colors.textSecondary} icon="school-outline" />
          <Pill
            label={card.provides_vehicle ? 'Veículo próprio' : 'Sem veículo'}
            color={card.provides_vehicle ? theme.colors.success : theme.colors.textSecondary}
            icon="car-outline"
          />
        </View>
        {card.teaching_method ? (
          <Txt variant="body" style={{ marginTop: theme.space.sm }}>
            {card.teaching_method}
          </Txt>
        ) : null}
      </Card>

      <Txt variant="title3">Horários disponíveis</Txt>
      <Muted>Só aparecem aulas com início em pelo menos 8 dias (REQ03).</Muted>

      {slots.length === 0 ? (
        <EmptyState icon="calendar-outline" text="Sem horários disponíveis no momento." />
      ) : (
        slots.map((s) => (
          <Card
            key={s.id}
            onPress={() =>
              nav.navigate('Payment', { slotId: s.id, price: card.price, instructorName: card.full_name })
            }
          >
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
              <Txt variant="body" style={{ flex: 1 }}>
                {formatDateTime(s.start_at)}
              </Txt>
              <Txt variant="subhead" color={theme.colors.accent}>
                Solicitar
              </Txt>
              <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
