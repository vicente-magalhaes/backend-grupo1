import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import type { InstructorProfileOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import {
  Avatar,
  Button,
  Card,
  Loading,
  Muted,
  Screen,
  StatusBadge,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';

export function InstructorProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<InstructorProfileOut | null>(null);
  const [price, setPrice] = useState('');
  const [region, setRegion] = useState('');
  const [method, setMethod] = useState('');
  const [msg, setMsg] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    instructorsApi
      .me()
      .then((p) => {
        setProfile(p);
        setPrice(String(p.price));
        setRegion(p.region);
        setMethod(p.teaching_method ?? '');
      })
      .catch((e) => setMsg({ text: apiErrorMessage(e), tone: 'danger' }));
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const updated = await instructorsApi.updateMe({
        price: parseFloat(price.replace(',', '.')) || undefined,
        region,
        teaching_method: method,
      });
      setProfile(updated);
      setMsg({ text: 'Perfil atualizado.', tone: 'success' });
    } catch (e) {
      setMsg({ text: apiErrorMessage(e), tone: 'danger' });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <Loading label="Carregando perfil..." />;

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center' }}>
          <Avatar name={user?.full_name} size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt variant="title3">{user?.full_name}</Txt>
              <StatusBadge status={profile.status} />
            </View>
            <Muted>{user?.email}</Muted>
          </View>
        </View>
        <Muted>
          Categorias {profile.categories.join('/')} ·{' '}
          {profile.provides_vehicle ? 'Veículo próprio' : 'Sem veículo'}
        </Muted>
        {profile.status === 'pending' ? (
          <Muted>Seu perfil está em análise e ainda não aparece na busca dos alunos.</Muted>
        ) : null}
      </Card>

      <Card>
        <Txt variant="headline">Dados do anúncio</Txt>
        <TextField label="Região de atuação" value={region} onChangeText={setRegion} icon="location-outline" />
        <TextField
          label="Preço por aula (R$)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          icon="cash-outline"
        />
        <TextField
          label="Método de ensino"
          value={method}
          onChangeText={setMethod}
          multiline
          icon="chatbox-ellipses-outline"
        />
        {msg ? <Toast message={msg.text} tone={msg.tone} /> : null}
        <Button title="Salvar alterações" onPress={save} loading={saving} />
      </Card>

      <Button title="Sair" variant="danger-outline" icon="log-out-outline" onPress={logout} />
    </Screen>
  );
}
