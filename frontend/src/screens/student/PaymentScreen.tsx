import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { bookingsApi } from '../../api/endpoints';
import { Card, Field, H1, Muted, PrimaryButton, Screen } from '../../components/ui';
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
          <H1>✅ Comprovante</H1>
          <Muted>Solicitação enviada e pagamento efetuado.</Muted>
          <Text>Instrutor: {instructorName}</Text>
          <Text>Valor: {money(price)}</Text>
          <Text>Método: {METHODS.find((m) => m.key === method)?.label}</Text>
          <Muted>
            Aguardando confirmação do instrutor (até 24h). Se ele não responder, o valor é devolvido.
          </Muted>
          <PrimaryButton title="Ver meus agendamentos" onPress={() => nav.navigate('Tabs', { screen: 'Agendamentos' })} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <H1>Pagamento</H1>
        <Text>Instrutor: {instructorName}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.primaryDark }}>
          {money(price)}
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Modalidade do veículo</Text>
        <View style={styles.row}>
          <Chip label="Veículo do instrutor" active={modality === 'instructor'} onPress={() => setModality('instructor')} />
          <Chip label="Meu veículo" active={modality === 'own'} onPress={() => setModality('own')} />
        </View>

        <Text style={styles.label}>Forma de pagamento</Text>
        <View style={styles.row}>
          {METHODS.map((m) => (
            <Chip key={m.key} label={m.label} active={method === m.key} onPress={() => setMethod(m.key)} />
          ))}
        </View>

        <Text style={styles.label}>Ponto de encontro (REQ07)</Text>
        <View style={styles.row}>
          <Chip label="Usar endereço do cadastro" active={keepAddress} onPress={() => setKeepAddress(true)} />
          <Chip label="Informar outro" active={!keepAddress} onPress={() => setKeepAddress(false)} />
        </View>
        {!keepAddress ? (
          <Field label="Novo endereço" value={newAddress} onChangeText={setNewAddress} />
        ) : null}
      </Card>

      <Muted>O pagamento (simulado) é confirmado já na solicitação (REQ09).</Muted>
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <PrimaryButton title={`Confirmar e pagar ${money(price)}`} onPress={confirm} loading={loading} />
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.primaryLight }]}
    >
      <Text style={{ color: active ? '#fff' : theme.colors.primaryDark, fontWeight: '600', fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  label: { fontSize: 13, fontWeight: '600' as const, color: theme.colors.text, marginTop: 4 },
  row: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
};
