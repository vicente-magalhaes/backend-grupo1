import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import type { InstructorProfileOut } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import {
  Card,
  Field,
  H1,
  Loading,
  Muted,
  OutlineButton,
  PrimaryButton,
  Screen,
  StatusBadge,
} from '../../components/ui';
import { theme } from '../../theme';

export function InstructorProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<InstructorProfileOut | null>(null);
  const [price, setPrice] = useState('');
  const [region, setRegion] = useState('');
  const [method, setMethod] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
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
      .catch((e) => setMsg(apiErrorMessage(e)));
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
      setMsg('Perfil atualizado.');
    } catch (e) {
      setMsg(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <Loading />;

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H1>{user?.full_name}</H1>
          <StatusBadge status={profile.status} />
        </View>
        <Muted>
          {user?.email} · Categorias {profile.categories.join('/')} ·{' '}
          {profile.provides_vehicle ? 'Veículo próprio' : 'Sem veículo'}
        </Muted>
        {profile.status === 'pending' ? (
          <Muted>Seu perfil está em análise e ainda não aparece na busca dos alunos.</Muted>
        ) : null}
      </Card>

      <Card>
        <Field label="Região de atuação" value={region} onChangeText={setRegion} />
        <Field label="Preço por aula (R$)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Field label="Método de ensino" value={method} onChangeText={setMethod} multiline />
        {msg ? <Text style={{ color: theme.colors.primary }}>{msg}</Text> : null}
        <PrimaryButton title="Salvar alterações" onPress={save} loading={saving} />
      </Card>

      <OutlineButton title="Sair" onPress={logout} tone="danger" />
    </Screen>
  );
}
