import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Field, H1, LogoPlaceholder, Muted, PrimaryButton, Screen } from '../../components/ui';
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
      <View style={{ marginTop: 24 }}>
        <LogoPlaceholder />
      </View>
      <H1>Entrar</H1>
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="voce@email.com"
      />
      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••"
      />
      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <PrimaryButton title="Entrar" onPress={onSubmit} loading={loading} />
      <Pressable onPress={() => nav.navigate('Register')} style={{ marginTop: 8 }}>
        <Text style={{ color: theme.colors.primary, textAlign: 'center' }}>
          Não tem conta? Cadastre-se
        </Text>
      </Pressable>
      <View style={{ marginTop: 24 }}>
        <Muted>Demo (senha: senha123):</Muted>
        <Muted>aluno → vicente@aluno.com</Muted>
        <Muted>instrutor → joao@instrutor.com</Muted>
      </View>
    </Screen>
  );
}
