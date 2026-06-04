import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { reportsApi } from '../../api/endpoints';
import { Card, Field, H1, Muted, PrimaryButton, Screen } from '../../components/ui';
import { theme } from '../../theme';

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: '600', color: theme.colors.text }}>
        {label}: <Text style={{ color: theme.colors.primaryDark }}>{value}</Text>
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable style={stepStyle} onPress={() => onChange(Math.max(0, value - 1))}>
          <Text style={stepText}>−</Text>
        </Pressable>
        <View style={{ flex: 1, height: 10, backgroundColor: theme.colors.primaryLight, borderRadius: 6 }}>
          <View
            style={{
              height: 10,
              width: `${(value / 10) * 100}%`,
              backgroundColor: theme.colors.primary,
              borderRadius: 6,
            }}
          />
        </View>
        <Pressable style={stepStyle} onPress={() => onChange(Math.min(10, value + 1))}>
          <Text style={stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CreateReportScreen() {
  const nav = useNavigation<any>();
  const { bookingId } = useRoute<any>().params;
  const [baliza, setBaliza] = useState(5);
  const [percurso, setPercurso] = useState(5);
  const [embreagem, setEmbreagem] = useState(5);
  const [observations, setObservations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      await reportsApi.create({
        booking_id: bookingId,
        baliza,
        percurso,
        embreagem,
        observations,
        strengths,
        weaknesses,
      });
      nav.goBack();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <H1>Relatório de aula</H1>
      <Card>
        <Stepper label="Baliza" value={baliza} onChange={setBaliza} />
        <Stepper label="Percurso" value={percurso} onChange={setPercurso} />
        <Stepper label="Controle de embreagem" value={embreagem} onChange={setEmbreagem} />
      </Card>
      <Card>
        <Field label="Pontos fortes (alimenta a IA)" value={strengths} onChangeText={setStrengths} multiline />
        <Field label="Pontos a melhorar (alimenta a IA)" value={weaknesses} onChangeText={setWeaknesses} multiline />
        <Field label="Observações" value={observations} onChangeText={setObservations} multiline />
      </Card>
      <Muted>Ao salvar, a aula é marcada como concluída e o dashboard do aluno é atualizado.</Muted>
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <PrimaryButton title="Salvar relatório" onPress={submit} loading={loading} />
    </Screen>
  );
}

const stepStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: theme.colors.primary,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
const stepText = { color: '#fff', fontSize: 22, fontWeight: '800' as const };
