import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import {
  Button,
  Card,
  Icon,
  ListRow,
  Muted,
  Screen,
  SegmentedControl,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';
import { money } from '../../utils/format';

const METHODS = [
  { key: 'credit', label: 'Crédito' },
  { key: 'debit', label: 'Débito' },
  { key: 'pix', label: 'Pix' },
];

export function PaymentScreen() {
  const nav = useNavigation<any>();
  const { slotId, price, instructorName } = useRoute<any>().params;

  const [method, setMethod] = useState('pix');
  const [modality, setModality] = useState('instructor');
  const [keepAddress, setKeepAddress] = useState(true);
  const [newAddress, setNewAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function confirm() {
    setError(null);
    setLoading(true);
    try {
      await bookingsApi.create({
        slot_id: slotId,
        vehicle_modality: modality,
        payment_method: method,
        keep_registered_address: keepAddress,
        meeting_address: keepAddress ? undefined : newAddress,
      });
      setDone(true);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen>
        <Card>
          <View style={{ alignItems: 'center', gap: theme.space.sm, paddingVertical: theme.space.md }}>
            <Icon name="checkmark-circle" size={56} color={theme.colors.success} />
            <Txt variant="title2">Comprovante</Txt>
            <Muted>Solicitação enviada e pagamento efetuado.</Muted>
          </View>
          <ListRow icon="person" tileColor={theme.colors.tileBlue} title="Instrutor" value={instructorName} />
          <ListRow icon="cash" tileColor={theme.colors.tileGreen} title="Valor" value={money(price)} />
          <ListRow
            icon="card"
            tileColor={theme.colors.tilePurple}
            title="Método"
            value={METHODS.find((m) => m.key === method)?.label}
            last
          />
        </Card>
        <Muted>Aguardando confirmação do instrutor (até 24h). Se ele não responder, o valor é devolvido.</Muted>
        <Button
          title="Ver meus agendamentos"
          onPress={() => nav.navigate('Tabs', { screen: 'Agendamentos' })}
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button title={`Confirmar e pagar ${money(price)}`} onPress={confirm} loading={loading} />
      }
    >
      <Card>
        <Muted>Você está pagando</Muted>
        <Txt variant="largeTitle" color={theme.colors.accent}>
          {money(price)}
        </Txt>
        <Muted>Instrutor: {instructorName}</Muted>
      </Card>

      <Card>
        <Muted>Modalidade do veículo</Muted>
        <SegmentedControl
          options={[
            { label: 'Veículo do instrutor', value: 'instructor' },
            { label: 'Meu veículo', value: 'own' },
          ]}
          value={modality}
          onChange={setModality}
        />
        <Muted>Forma de pagamento</Muted>
        <SegmentedControl
          options={METHODS.map((m) => ({ label: m.label, value: m.key }))}
          value={method}
          onChange={setMethod}
        />
        <Muted>Ponto de encontro (REQ07)</Muted>
        <SegmentedControl
          options={[
            { label: 'Endereço do cadastro', value: 'keep' },
            { label: 'Informar outro', value: 'other' },
          ]}
          value={keepAddress ? 'keep' : 'other'}
          onChange={(v) => setKeepAddress(v === 'keep')}
        />
        {!keepAddress ? (
          <TextField label="Novo endereço" value={newAddress} onChangeText={setNewAddress} icon="location-outline" />
        ) : null}
      </Card>

      <Muted>O pagamento (simulado) é confirmado já na solicitação (REQ09).</Muted>
      {error ? <Toast message={error} /> : null}
    </Screen>
  );
}
