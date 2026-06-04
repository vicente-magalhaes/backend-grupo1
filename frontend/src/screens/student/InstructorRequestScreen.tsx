import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Card, Field, H1, Muted, PrimaryButton, Screen } from '../../components/ui';
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
          <H1>Solicitação enviada ✅</H1>
          <Muted>
            Seus documentos estão "Em Análise". Faça login novamente para acessar a área de
            instrutor.
          </Muted>
          <PrimaryButton title="Entrar novamente" onPress={logout} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Tornar-me instrutor</H1>
      <Card>
        <Text style={styles.label}>Categorias que vai lecionar</Text>
        <View style={styles.row}>
          {['A', 'B'].map((c) => (
            <Chip key={c} label={`Categoria ${c}`} active={categories.includes(c)} onPress={() => toggleCat(c)} />
          ))}
        </View>

        <Text style={styles.label}>Fornece veículo próprio?</Text>
        <View style={styles.row}>
          <Chip label="Sim" active={providesVehicle} onPress={() => setProvidesVehicle(true)} />
          <Chip label="Não" active={!providesVehicle} onPress={() => setProvidesVehicle(false)} />
        </View>

        <Muted>Documentos (identificador/link — upload simulado nesta versão):</Muted>
        <Field label="CNH" value={form.cnh_url} onChangeText={set('cnh_url')} />
        <Field label="Credencial oficial" value={form.credential_url} onChangeText={set('credential_url')} />
        {providesVehicle ? (
          <>
            <Field label="CRLV do veículo" value={form.crlv_url} onChangeText={set('crlv_url')} />
            <Field label="Foto do veículo" value={form.vehicle_photo_url} onChangeText={set('vehicle_photo_url')} />
          </>
        ) : null}

        <Field label="Região de atuação" value={form.region} onChangeText={set('region')} />
        <Field
          label="Preço por aula (R$)"
          value={form.price}
          onChangeText={set('price')}
          keyboardType="decimal-pad"
        />
        <Field
          label="Método de ensino"
          value={form.teaching_method}
          onChangeText={set('teaching_method')}
          multiline
        />
      </Card>

      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <PrimaryButton title="Enviar solicitação" onPress={submit} loading={loading} />
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? theme.colors.primary : theme.colors.primaryLight }]}
    >
      <Text style={{ color: active ? '#fff' : theme.colors.primaryDark, fontWeight: '600', fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  label: { fontSize: 13, fontWeight: '600' as const, color: theme.colors.text, marginTop: 4 },
  row: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
};
