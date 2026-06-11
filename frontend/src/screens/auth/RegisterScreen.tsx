import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Button, Muted, Screen, TextField, Toast, Txt } from '../../components';

export function RegisterScreen() {
  const nav = useNavigation<any>();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    meeting_address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Txt variant="title2">Criar conta de aluno</Txt>
      <Muted>Preencha todos os campos para se cadastrar (REQ01).</Muted>
      <TextField label="Nome completo" value={form.full_name} onChangeText={set('full_name')} icon="person-outline" />
      <TextField
        label="E-mail"
        value={form.email}
        onChangeText={set('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        icon="mail-outline"
      />
      <TextField label="Telefone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" icon="call-outline" />
      <TextField
        label="CPF (11 dígitos)"
        value={form.cpf}
        onChangeText={set('cpf')}
        keyboardType="number-pad"
        icon="card-outline"
      />
      <TextField
        label="Senha (mín. 6)"
        value={form.password}
        onChangeText={set('password')}
        secureToggle
        icon="lock-closed-outline"
      />
      <TextField
        label="Endereço do ponto de encontro"
        value={form.meeting_address}
        onChangeText={set('meeting_address')}
        icon="location-outline"
      />
      {error ? <Toast message={error} /> : null}
      <Button title="Cadastrar" onPress={onSubmit} loading={loading} />
      <Button title="Já tenho conta" variant="ghost" onPress={() => nav.goBack()} />
    </Screen>
  );
}
