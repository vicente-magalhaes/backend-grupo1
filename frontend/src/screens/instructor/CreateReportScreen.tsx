import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';

import { apiErrorMessage } from '../../api/client';
import { reportsApi } from '../../api/endpoints';
import { Button, Card, Muted, Screen, Stepper, TextField, Toast, Txt } from '../../components';

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
    <Screen footer={<Button title="Salvar relatório" onPress={submit} loading={loading} />}>
      <Txt variant="title2">Relatório de aula</Txt>
      <Card>
        <Stepper label="Baliza" value={baliza} onChange={setBaliza} />
        <Stepper label="Percurso" value={percurso} onChange={setPercurso} />
        <Stepper label="Controle de embreagem" value={embreagem} onChange={setEmbreagem} />
      </Card>
      <Card>
        <TextField label="Pontos fortes (alimenta a IA)" value={strengths} onChangeText={setStrengths} multiline />
        <TextField
          label="Pontos a melhorar (alimenta a IA)"
          value={weaknesses}
          onChangeText={setWeaknesses}
          multiline
        />
        <TextField label="Observações" value={observations} onChangeText={setObservations} multiline />
      </Card>
      <Muted>Ao salvar, a aula é marcada como concluída e o dashboard do aluno é atualizado.</Muted>
      {error ? <Toast message={error} /> : null}
    </Screen>
  );
}
