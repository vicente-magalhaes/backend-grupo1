import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '../theme';

/** Espaço reservado para a logo (cinza) — a arte final entra depois. */
export function LogoPlaceholder({ size = 88 }: { size?: number }) {
  return (
    <View style={styles.logoWrap}>
      <View style={[styles.logoBox, { width: size, height: size }]}>
        <Text style={styles.logoBoxText}>LOGO</Text>
      </View>
      <Text style={styles.logoTitle}>CNH Connect</Text>
    </View>
  );
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  if (scroll) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.screen, styles.screenContent]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        styles.btnPrimary,
        (disabled || loading) && styles.btnDisabled,
        pressed && styles.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.btnPrimaryText}>{title}</Text>
      )}
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  tone = 'primary',
}: {
  title: string;
  onPress: () => void;
  tone?: 'primary' | 'danger';
}) {
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { borderWidth: 1.5, borderColor: color, backgroundColor: 'transparent' },
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={[styles.btnPrimaryText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Stars({ value }: { value?: number | null }) {
  if (value === null || value === undefined) {
    return <Text style={styles.muted}>Sem avaliações</Text>;
  }
  const full = Math.round(value);
  return (
    <Text style={{ color: theme.colors.star }}>
      {'★'.repeat(full)}
      <Text style={styles.muted}>
        {'★'.repeat(Math.max(0, 5 - full))} {value.toFixed(1)}
      </Text>
    </Text>
  );
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_confirmation: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
  pending: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Recusado',
  paid: 'Pago',
  refunded: 'Reembolsado',
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: theme.colors.success,
  approved: theme.colors.success,
  paid: theme.colors.success,
  awaiting_confirmation: theme.colors.warning,
  pending: theme.colors.warning,
  cancelled: theme.colors.danger,
  rejected: theme.colors.danger,
  refunded: theme.colors.muted,
  completed: theme.colors.primary,
};

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? theme.colors.muted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Text style={[styles.badgeText, { color }]}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? <Text style={[styles.muted, { marginTop: 8 }]}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={styles.h1}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  screenContent: { padding: 16, gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  logoWrap: { alignItems: 'center', gap: 8, marginVertical: 8 },
  logoBox: {
    backgroundColor: '#CBD5E1',
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBoxText: { color: '#64748B', fontWeight: '700', letterSpacing: 1 },
  logoTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.primaryDark },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  btn: {
    borderRadius: theme.radius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: theme.colors.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  btnPressed: { opacity: 0.8 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: theme.colors.text,
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  muted: { color: theme.colors.muted, fontSize: 13 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
});
