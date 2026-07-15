import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "@/constants/colors";
import { DeviceCategory } from "@/types";

interface CategoryIconProps {
  category: DeviceCategory;
  size?: number;
  showBackground?: boolean;
}

export function CategoryIcon({
  category,
  size = 20,
  showBackground = true,
}: CategoryIconProps) {
  const categoryConfig: Record<
    DeviceCategory,
    { icon: React.ReactNode; color: string }
  > = {
    cameras: {
      icon: <Feather name="camera" size={size} color={colors.primary} />,
      color: colors.primary,
    },
    lights: {
      icon: <Feather name="sun" size={size} color={colors.primary} />,
      color: "#000000",
    },
    audio: {
      icon: <Feather name="mic" size={size} color={colors.primary}  />,
      color: "#000000",
    },
    drones: {
      icon: (
        <MaterialCommunityIcons name="quadcopter" size={size} color={colors.primary}  />
      ),
      color: "#30D158",
    },
    other: {
      icon: <Feather name="box" size={size} color={colors.primary}  />,
      color: colors.mutedForeground,
    },
  };

  const config = categoryConfig[category];

  if (!showBackground) {
    return <>{config.icon}</>;
  }

  return (
    <View
      style={[
        styles.iconBg,
        {
          backgroundColor: config.color + "18",
          borderColor: config.color + "30",
        },
        { width: size * 2.2, height: size * 2.2, borderRadius: size * 1.1 },
      ]}
    >
      {config.icon}
    </View>
  );
}

export function getCategoryLabel(category: DeviceCategory): string {
  const labels: Record<DeviceCategory, string> = {
    cameras: "Cameras",
    lights: "Lights",
    audio: "Audio",
    drones: "Drones",
    other: "Other",
  };
  return labels[category];
}

const styles = StyleSheet.create({
  iconBg: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
