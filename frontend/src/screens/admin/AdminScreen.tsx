import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Card, H1, LogoPlaceholder, Muted, OutlineButton, Screen } from '../../components/ui';

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
      <LogoPlaceholder />
      <H1>Painel do Administrador</H1>
      <Muted>Olá, {user?.full_name}.</Muted>
      <Card>
        <Text>Visão geral do sistema</Text>
        <Muted>{info}</Muted>
      </Card>
      <OutlineButton title="Sair" onPress={logout} tone="danger" />
    </Screen>
  );
}
