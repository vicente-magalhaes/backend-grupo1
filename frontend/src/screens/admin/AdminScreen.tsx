import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Button, Card, Icon, Logo, Muted, Screen, Txt } from '../../components';
import { theme } from '../../theme';

export function AdminScreen() {
  const { user, logout } = useAuth();
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    instructorsApi
      .search({})
      .then((list) => setInfo(`${list.length} instrutor(es) aprovado(s) no marketplace.`))
      .catch((e) => setInfo(apiErrorMessage(e)));
  }, []);

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: theme.space.lg }}>
        <Logo size={64} showWordmark />
      </View>
      <Txt variant="title2">Painel do Administrador</Txt>
      <Muted>Olá, {user?.full_name}.</Muted>
      <Card>
        <View style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'center' }}>
          <Icon name="stats-chart" size={20} color={theme.colors.accent} />
          <Txt variant="headline">Visão geral do sistema</Txt>
        </View>
        <Muted>{info}</Muted>
      </Card>
      <Button title="Sair" variant="danger-outline" icon="log-out-outline" onPress={logout} />
    </Screen>
  );
}
