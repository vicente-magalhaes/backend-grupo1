import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { View } from 'react-native';

import { apiErrorMessage } from '../../api/client';
import { instructorsApi } from '../../api/endpoints';
import type { InstructorCard } from '../../api/types';
import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Loading,
  Muted,
  Pill,
  Screen,
  SegmentedControl,
  Stars,
  TextField,
  Toast,
  Txt,
} from '../../components';
import { theme } from '../../theme';
import { money } from '../../utils/format';

export function SearchScreen() {
  const nav = useNavigation<any>();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [region, setRegion] = useState('');
  const [needsVehicle, setNeedsVehicle] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
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
        sort_by: sortBy === 'relevance' ? undefined : sortBy,
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
        <Muted>Categoria</Muted>
        <View style={{ flexDirection: 'row', gap: theme.space.sm }}>
          {['A', 'B'].map((c) => (
            <Chip
              key={c}
              label={`Categoria ${c}`}
              selected={category === c}
              onPress={() => setCategory(category === c ? undefined : c)}
            />
          ))}
        </View>
        <TextField
          label="Bairro / Região"
          value={region}
          onChangeText={setRegion}
          placeholder="Ex.: Pinheiros"
          icon="location-outline"
        />
        <Muted>Modalidade do veículo</Muted>
        <SegmentedControl
          options={[
            { label: 'Tenho veículo', value: 'own' },
            { label: 'Preciso do instrutor', value: 'instructor' },
          ]}
          value={needsVehicle ? 'instructor' : 'own'}
          onChange={(v) => setNeedsVehicle(v === 'instructor')}
        />
        <Muted>Ordenar por</Muted>
        <SegmentedControl
          options={[
            { label: 'Relevância', value: 'relevance' },
            { label: 'Nota', value: 'rating' },
            { label: 'Aulas', value: 'lessons' },
          ]}
          value={sortBy}
          onChange={setSortBy}
        />
        <Button title="Buscar instrutores" icon="search" onPress={search} />
      </Card>

      {error ? <Toast message={error} /> : null}
      {loading ? <Loading label="Buscando instrutores..." /> : null}
      {results && results.length === 0 ? (
        <EmptyState icon="search-outline" text="Nenhum instrutor encontrado. Tente alterar os filtros." />
      ) : null}

      {results?.map((c) => (
        <Card
          key={c.instructor_id}
          onPress={() => nav.navigate('InstructorDetail', { instructorId: c.instructor_id })}
        >
          <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center' }}>
            <Avatar name={c.full_name} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="headline">{c.full_name}</Txt>
              <Muted>
                {c.region} · Cat. {c.categories.join('/')}
              </Muted>
              <Stars value={c.avg_rating} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Txt variant="headline" color={theme.colors.accent}>
                {money(c.price)}
              </Txt>
              <Pill
                label={c.provides_vehicle ? 'Com veículo' : 'Sem veículo'}
                color={c.provides_vehicle ? theme.colors.success : theme.colors.textSecondary}
              />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
