import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Field, H1, Muted, PrimaryButton, Screen } from '../../components/ui';
import { theme } from '../../theme';

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
      <H1>Criar conta de aluno</H1>
      <Muted>Preencha todos os campos para se cadastrar (REQ01).</Muted>
      <Field label="Nome completo" value={form.full_name} onChangeText={set('full_name')} />
      <Field
        label="E-mail"
        value={form.email}
        onChangeText={set('email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        label="Telefone"
        value={form.phone}
        onChangeText={set('phone')}
        keyboardType="phone-pad"
      />
      <Field
        label="CPF (11 dígitos)"
        value={form.cpf}
        onChangeText={set('cpf')}
        keyboardType="number-pad"
      />
      <Field label="Senha (mín. 6)" value={form.password} onChangeText={set('password')} secureTextEntry />
      <Field
        label="Endereço do ponto de encontro"
        value={form.meeting_address}
        onChangeText={set('meeting_address')}
      />
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <PrimaryButton title="Cadastrar" onPress={onSubmit} loading={loading} />
      <Pressable onPress={() => nav.goBack()} style={{ marginTop: 8 }}>
        <Text style={{ color: theme.colors.primary, textAlign: 'center' }}>Já tenho conta</Text>
      </Pressable>
    </Screen>
  );
}
