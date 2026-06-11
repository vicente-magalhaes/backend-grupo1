import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { usersApi } from '../../api/endpoints';
import type { NotificationOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Icon,
  Muted,
  Screen,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';
import { formatDateTime } from '../../utils/format';

export function StudentProfileScreen() {
  const nav = useNavigation<any>();
  const { user, logout, refresh } = useAuth();
  const [full_name, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [meeting_address, setAddress] = useState(user?.meeting_address ?? '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);
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
      setMsg({ text: 'Perfil atualizado com sucesso.', tone: 'success' });
    } catch (e) {
      setMsg({ text: apiErrorMessage(e), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center' }}>
          <Avatar name={user?.full_name} size={56} />
          <View style={{ flex: 1 }}>
            <Txt variant="title3">{user?.full_name}</Txt>
            <Muted>{user?.email}</Muted>
          </View>
        </View>
      </Card>

      <Card>
        <Txt variant="headline">Dados pessoais</Txt>
        <Muted>CPF: {user?.cpf}</Muted>
        <TextField label="Nome completo" value={full_name} onChangeText={setFullName} icon="person-outline" />
        <TextField label="Telefone" value={phone} onChangeText={setPhone} icon="call-outline" />
        <TextField
          label="Endereço do ponto de encontro"
          value={meeting_address}
          onChangeText={setAddress}
          icon="location-outline"
        />
        <TextField
          label="Nova senha (opcional)"
          value={password}
          onChangeText={setPassword}
          secureToggle
          icon="lock-closed-outline"
        />
        {msg ? <Toast message={msg.text} tone={msg.tone} /> : null}
        <Button title="Salvar alterações" onPress={save} loading={saving} />
      </Card>

      <Card>
        <Txt variant="headline">Quer dar aulas?</Txt>
        <Muted>Solicite a habilitação como instrutor parceiro (REQ02).</Muted>
        <Button
          title="Tornar-me instrutor"
          icon="car-outline"
          variant="outline"
          onPress={() => nav.navigate('InstructorRequest')}
        />
      </Card>

      <Txt variant="title3">Notificações</Txt>
      {notifs.length === 0 ? (
        <EmptyState icon="notifications-outline" text="Nenhuma notificação." />
      ) : (
        notifs.map((n) => (
          <Card key={n.id}>
            <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
              <Icon name="notifications" size={18} color={theme.colors.accent} />
              <View style={{ flex: 1 }}>
                <Txt variant="body">{n.message}</Txt>
                <Muted>{formatDateTime(n.created_at)}</Muted>
              </View>
            </View>
          </Card>
        ))
      )}

      <Button title="Sair" variant="danger-outline" icon="log-out-outline" onPress={logout} />
    </Screen>
  );
}
