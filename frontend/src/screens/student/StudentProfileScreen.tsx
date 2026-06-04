import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { usersApi } from '../../api/endpoints';
import type { NotificationOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import {
  Card,
  Field,
  H1,
  Muted,
  OutlineButton,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { theme } from '../../theme';
import { formatDateTime } from '../../utils/format';

export function StudentProfileScreen() {
  const nav = useNavigation<any>();
  const { user, logout, refresh } = useAuth();
  const [full_name, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [meeting_address, setAddress] = useState(user?.meeting_address ?? '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState<NotificationOut[]>([]);

  useEffect(() => {
    usersApi.notifications().then(setNotifs).catch(() => undefined);
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await usersApi.updateMe({
        full_name,
        phone,
        meeting_address,
        ...(password ? { password } : {}),
      });
      await refresh();
      setPassword('');
      setMsg('Perfil atualizado com sucesso.');
    } catch (e) {
      setMsg(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Card>
        <H1>Meu perfil</H1>
        <Muted>E-mail: {user?.email} · CPF: {user?.cpf}</Muted>
        <Field label="Nome completo" value={full_name} onChangeText={setFullName} />
        <Field label="Telefone" value={phone} onChangeText={setPhone} />
        <Field label="Endereço do ponto de encontro" value={meeting_address} onChangeText={setAddress} />
        <Field label="Nova senha (opcional)" value={password} onChangeText={setPassword} secureTextEntry />
        {msg ? <Text style={{ color: theme.colors.primary }}>{msg}</Text> : null}
        <PrimaryButton title="Salvar alterações" onPress={save} loading={saving} />
      </Card>

      <Card>
        <Text style={{ fontWeight: '700' }}>Quer dar aulas?</Text>
        <Muted>Solicite a habilitação como instrutor parceiro (REQ02).</Muted>
        <OutlineButton title="Tornar-me instrutor" onPress={() => nav.navigate('InstructorRequest')} />
      </Card>

      <Text style={{ fontWeight: '700', fontSize: 16, color: theme.colors.text }}>Notificações</Text>
      {notifs.length === 0 ? (
        <Muted>Nenhuma notificação.</Muted>
      ) : (
        notifs.map((n) => (
          <Card key={n.id}>
            <Text>{n.message}</Text>
            <Muted>{formatDateTime(n.created_at)}</Muted>
          </Card>
        ))
      )}

      <OutlineButton title="Sair" onPress={logout} tone="danger" />
    </Screen>
  );
}
