import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBattery } from "@/context/BatteryContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Device, DeviceCategory } from "@/types";

interface Props {
  visible: boolean;
  device?: Device | null;
  onClose: () => void;
}

const CATEGORIES: DeviceCategory[] = [
  "cameras",
  "lights",
  "audio",
  "drones",
  "other",
];

const CATEGORY_ICONS: Record<
  DeviceCategory,
  (color: string) => React.ReactNode
> = {
  cameras: (c) => <Feather name="camera" size={18} color={c} />,
  lights: (c) => <Feather name="sun" size={18} color={c} />,
  audio: (c) => <Feather name="mic" size={18} color={c} />,
  drones: (c) => (
    <MaterialCommunityIcons name="quadcopter" size={18} color={c} />
  ),
  other: (c) => <Feather name="box" size={18} color={c} />,
};

export function AddEditDeviceSheet({ visible, device, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { addDevice, updateDevice } = useBattery();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DeviceCategory>("cameras");
  const [saving, setSaving] = useState(false);

  const categoryLabels: Record<DeviceCategory, string> = {
    cameras: t.filterCameras,
    lights: t.filterLights,
    audio: t.filterAudio,
    drones: t.filterDrones,
    other: t.filterOther,
  };

  useEffect(() => {
    if (visible) {
      setName(device?.name ?? "");
      setCategory(device?.category ?? "cameras");
    }
  }, [visible, device]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (device) await updateDevice(device.id, name.trim(), category);
      else await addDevice(name.trim(), category);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontWeight: "700" },
              ]}
            >
              {device ? t.editDevice : t.newDevice}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {t.deviceNameLabel}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t.deviceNamePlaceholder}
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              {t.categoryLabel}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCategory(cat);
                    }}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected
                          ? colors.card
                          : "#1a1a1a",
                        borderColor: isSelected ? colors.primary : "#1a1a1a",
                      },
                    ]}
                  >
                    {CATEGORY_ICONS[cat](isSelected ? colors.primary : "#fdfdfd")}
                    <Text
                      style={[
                        styles.catText,
                        { color: isSelected ? colors.primary : "#fbfbfb" },
                      ]}
                    >
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* save device button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,

              {
                display: name.trim() ? "flex" : "none",
                backgroundColor: colors.primary
              },
            ]}
            onPress={handleSave}
            disabled={!name.trim() || saving}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.saveBtnText,
                {
                  color: name.trim()
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                },
              ]}
            >
              {device ? t.saveChanges : t.addDevice}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    gap: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  field: { gap: 10 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  catRow: { gap: 8, paddingRight: 4 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
