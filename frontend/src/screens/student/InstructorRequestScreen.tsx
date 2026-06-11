import { useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import {
  Button,
  Card,
  Chip,
  Icon,
  Muted,
  Screen,
  SegmentedControl,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';

export function InstructorRequestScreen() {
  const { logout } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [providesVehicle, setProvidesVehicle] = useState(false);
  const [form, setForm] = useState({
    cnh_url: '',
    credential_url: '',
    crlv_url: '',
    vehicle_photo_url: '',
    teaching_method: '',
    price: '',
    region: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCat = (c: string) =>
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      await instructorsApi.request({
        categories,
        provides_vehicle: providesVehicle,
        cnh_url: form.cnh_url,
        credential_url: form.credential_url,
        crlv_url: providesVehicle ? form.crlv_url : null,
        vehicle_photo_url: providesVehicle ? form.vehicle_photo_url : null,
        teaching_method: form.teaching_method || null,
        price: parseFloat(form.price.replace(',', '.')) || 0,
        region: form.region,
      });
      setDone(true);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen>
        <Card>
          <View style={{ alignItems: 'center', gap: theme.space.sm, paddingVertical: theme.space.md }}>
            <Icon name="checkmark-circle" size={56} color={theme.colors.success} />
            <Txt variant="title2">Solicitação enviada</Txt>
            <Muted style={{ textAlign: 'center' }}>
              Seus documentos estão "Em Análise". Faça login novamente para acessar a área de instrutor.
            </Muted>
          </View>
          <Button title="Entrar novamente" onPress={logout} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Enviar solicitação" onPress={submit} loading={loading} />}>
      <Txt variant="title2">Tornar-me instrutor</Txt>
      <Card>
        <Muted>Categorias que vai lecionar</Muted>
        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          {['A', 'B'].map((c) => (
            <Chip key={c} label={`Categoria ${c}`} selected={categories.includes(c)} onPress={() => toggleCat(c)} />
          ))}
        </View>

        <Muted>Fornece veículo próprio?</Muted>
        <SegmentedControl
          options={[
            { label: 'Sim', value: 'yes' },
            { label: 'Não', value: 'no' },
          ]}
          value={providesVehicle ? 'yes' : 'no'}
          onChange={(v) => setProvidesVehicle(v === 'yes')}
        />

        <Muted>Documentos (identificador/link — upload simulado nesta versão):</Muted>
        <TextField label="CNH" value={form.cnh_url} onChangeText={set('cnh_url')} icon="document-text-outline" />
        <TextField
          label="Credencial oficial"
          value={form.credential_url}
          onChangeText={set('credential_url')}
          icon="ribbon-outline"
        />
        {providesVehicle ? (
          <>
            <TextField label="CRLV do veículo" value={form.crlv_url} onChangeText={set('crlv_url')} icon="document-outline" />
            <TextField
              label="Foto do veículo"
              value={form.vehicle_photo_url}
              onChangeText={set('vehicle_photo_url')}
              icon="camera-outline"
            />
          </>
        ) : null}

        <TextField label="Região de atuação" value={form.region} onChangeText={set('region')} icon="location-outline" />
        <TextField
          label="Preço por aula (R$)"
          value={form.price}
          onChangeText={set('price')}
          keyboardType="decimal-pad"
          icon="cash-outline"
        />
        <TextField
          label="Método de ensino"
          value={form.teaching_method}
          onChangeText={set('teaching_method')}
          multiline
          icon="chatbox-ellipses-outline"
        />
      </Card>

      {error ? <Toast message={error} /> : null}
    </Screen>
  );
}
