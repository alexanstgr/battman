import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { BatteryStatus } from '@/types';

interface StatusBadgeProps {
  status: BatteryStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const t = useTranslation();

  const statusColor =
    status === 'charged' ? colors.charged :
    status === 'charging' ? colors.charging :
    colors.discharged;

  const label =
    status === 'charged' ? t.statusCharged :
    status === 'charging' ? t.statusCharging :
    t.statusDischarged;

  const icon =
    status === 'charged' ? 'battery-charging' :
    status === 'charging' ? 'zap' :
    'battery';

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: statusColor + '15' }, isSmall && styles.sm]}>
      <Feather name={icon as 'zap'} size={isSmall ? 9 : 11} color={statusColor} />
      <Text style={[styles.label, { color: statusColor }, isSmall && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 10,
  },
});
