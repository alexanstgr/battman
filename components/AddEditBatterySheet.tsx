import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBattery } from '@/context/BatteryContext';

import colors from '@/constants/colors';
import { useTranslation } from '@/hooks/useTranslation';
import { Battery, BatteryStatus } from '@/types';

interface Props {
  visible: boolean;
  deviceId: string;
  battery?: Battery | null;
  onClose: () => void;
}

const STATUS_ORDER: BatteryStatus[] = ['charged', 'charging', 'discharged'];

export function AddEditBatterySheet({ visible, deviceId, battery, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { addBattery, updateBattery } = useBattery();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<BatteryStatus>('charged');
  const [saving, setSaving] = useState(false);

  const statusConfig: Record<BatteryStatus, { label: string; color: string; icon: string }> = {
    charged: { label: t.statusCharged, color: colors.charged, icon: 'battery-charging' },
    charging: { label: t.statusCharging, color: colors.charging, icon: 'zap' },
    discharged: { label: t.statusDischarged, color: colors.discharged, icon: 'battery' },
  };

  useEffect(() => {
    if (visible) {
      setName(battery?.name ?? '');
      setStatus(battery?.status ?? 'charged');
    }
  }, [visible, battery]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (battery) await updateBattery(battery.id, name.trim(), status);
      else await addBattery(deviceId, name.trim(), status);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[
          styles.sheet,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border, paddingBottom: insets.bottom + 16 },
        ]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {battery ? t.editBattery : t.addBattery}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.batteryNameLabel}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder={t.batteryNamePlaceholder}
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{t.statusLabel}</Text>
            <View style={styles.statusRow}>
              {STATUS_ORDER.map(s => {
                const cfg = statusConfig[s];
                const isSelected = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { Haptics.selectionAsync(); setStatus(s); }}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isSelected ? cfg.color + '18' : colors.muted,
                        borderColor: isSelected ? cfg.color : colors.border,
                        flex: 1,
                      },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: isSelected ? cfg.color : colors.mutedForeground + '40' }]} />
                    <Text style={[styles.statusLabel, { color: isSelected ? cfg.color : colors.mutedForeground }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: name.trim() ? colors.primary : colors.muted }]}
            onPress={handleSave}
            disabled={!name.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveBtnText, { color: name.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
              {battery ? t.saveChanges : t.addBattery}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    gap: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  field: { gap: 10 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase' },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1,
  },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  saveBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
});
