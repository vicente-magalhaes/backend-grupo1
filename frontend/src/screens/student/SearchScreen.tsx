import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import type { InstructorCard } from '../../api/types';
import {
  Card,
  EmptyState,
  Field,
  Loading,
  Muted,
  PrimaryButton,
  Screen,
  Stars,
} from '../../components/ui';
import { theme } from '../../theme';

const CATS = ['A', 'B'];

export function SearchScreen() {
  const nav = useNavigation<any>();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState('');
  const [needsVehicle, setNeedsVehicle] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<InstructorCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorsApi.search({
        category,
        region: region || undefined,
        needs_instructor_vehicle: needsVehicle || undefined,
        sort_by: sortBy,
      });
      setResults(data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.row}>
          {CATS.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? undefined : c)} />
          ))}
        </View>
        <Field label="Bairro / Região" value={region} onChangeText={setRegion} placeholder="Ex.: Pinheiros" />
        <Text style={styles.label}>Modalidade do veículo</Text>
        <View style={styles.row}>
          <Chip label="Tenho veículo" active={!needsVehicle} onPress={() => setNeedsVehicle(false)} />
          <Chip label="Preciso do instrutor" active={needsVehicle} onPress={() => setNeedsVehicle(true)} />
        </View>
        <Text style={styles.label}>Ordenar por</Text>
        <View style={styles.row}>
          <Chip label="Relevância" active={!sortBy} onPress={() => setSortBy(undefined)} />
          <Chip label="Nota" active={sortBy === 'rating'} onPress={() => setSortBy('rating')} />
          <Chip label="Aulas dadas" active={sortBy === 'lessons'} onPress={() => setSortBy('lessons')} />
        </View>
        <PrimaryButton title="Buscar instrutores" onPress={search} />
      </Card>

      {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
      {loading ? <Loading /> : null}
      {results && results.length === 0 ? (
        <EmptyState text="Nenhum instrutor encontrado com esses critérios. Tente alterar os filtros." />
      ) : null}

      {results?.map((c) => (
        <Pressable key={c.instructor_id} onPress={() => nav.navigate('InstructorDetail', { instructorId: c.instructor_id })}>
          <Card>
            <View style={styles.cardHead}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>FOTO</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.full_name}</Text>
                <Muted>
                  {c.region} · Cat. {c.categories.join('/')} · R$ {c.price.toFixed(2)}
                </Muted>
                <Stars value={c.avg_rating} />
                <Muted>
                  {c.total_lessons} aula(s) · {c.provides_vehicle ? 'Veículo próprio' : 'Sem veículo'}
                </Muted>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? theme.colors.primary : theme.colors.primaryLight },
      ]}
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
  cardHead: { flexDirection: 'row' as const, gap: 12, alignItems: 'center' as const },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CBD5E1',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: { color: '#64748B', fontSize: 10, fontWeight: '700' as const },
  name: { fontSize: 16, fontWeight: '700' as const, color: theme.colors.text },
};
