import { View } from 'react-native';

import { theme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './typography';

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
  refunded: theme.colors.textSecondary,
  completed: theme.colors.accent,
};

/** Pílula soft genérica (badge inline estilo "Cheaper"/"Good deal"). */
export function Pill({
  label,
  color = theme.colors.accent,
  icon,
}: {
  label: string;
  color?: string;
  icon?: IconName;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        backgroundColor: `${color}1A`,
        borderRadius: theme.radii.pill,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      {icon ? <Icon name={icon} size={12} color={color} /> : null}
      <Txt variant="caption" color={color}>
        {label}
      </Txt>
    </View>
  );
}

/** Badge de status (mantém labels/cores do domínio). */
export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? theme.colors.textSecondary;
  return <Pill label={STATUS_LABELS[status] ?? status} color={color} />;
}
