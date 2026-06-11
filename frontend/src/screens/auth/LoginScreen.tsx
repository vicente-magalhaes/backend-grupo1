import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Button, Logo, Muted, Screen, TextField, Toast, Txt } from '../../components';
import { theme } from '../../theme';

export function LoginScreen() {
  const nav = useNavigation<any>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: theme.space.xxl, marginBottom: theme.space.md }}>
        <Logo size={84} showWordmark />
        <Muted style={{ marginTop: 6 }}>Instrutores de direção, na palma da mão</Muted>
      </View>
      <Txt variant="title2">Entrar</Txt>
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="voce@email.com"
        icon="mail-outline"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureToggle
        placeholder="••••••"
        icon="lock-closed-outline"
      />
      {error ? <Toast message={error} /> : null}
      <Button title="Entrar" onPress={onSubmit} loading={loading} />
      <Button title="Não tem conta? Cadastre-se" variant="ghost" onPress={() => nav.navigate('Register')} />
      <View style={{ marginTop: theme.space.lg, gap: 2 }}>
        <Muted>Demo (senha: senha123):</Muted>
        <Muted>aluno → vicente@aluno.com</Muted>
        <Muted>instrutor → joao@instrutor.com</Muted>
      </View>
    </Screen>
  );
}
