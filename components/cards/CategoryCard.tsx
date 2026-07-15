import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import * as Haptics from "expo-haptics";

import { DeviceCategory } from "@/types";
import { CategoryIcon } from "../CategoryIcon";

interface CategoryCardProps {
  category: DeviceCategory;
  battCount: number;
  pct: number | null;
  selected: boolean;
  themeColors: any;
  styles: any;
  getCategoryLabel: (category: DeviceCategory) => string;
  onPress: (category: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  battCount,
  pct,
  selected,
  themeColors,
  styles,
  getCategoryLabel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress(category);
        Haptics.selectionAsync();
      }}
      style={[
        styles.catTile,
        {
          backgroundColor: themeColors.card,
          shadowColor: themeColors.shadow,
          borderColor: selected ? themeColors.primary : "transparent",
          borderWidth: 1.5,
        },
      ]}
    >
      <View
        style={[styles.catTileIcon, { backgroundColor: themeColors.muted }]}
      >
        <CategoryIcon category={category} size={14} showBackground={false} />
      </View>

      <Text style={[styles.catTileName, { color: themeColors.foreground }]}>
        {getCategoryLabel(category)}
      </Text>

      <Text
        style={[styles.catTileCount, { color: themeColors.mutedForeground }]}
      >
        {battCount} batt.
      </Text>

      {pct !== null && (
        <Text
          style={[
            styles.catTilePct,
            {
              color:
                pct === 100
                  ? themeColors.charged
                  : pct > 50
                    ? themeColors.primary
                    : themeColors.discharged,
            },
          ]}
        >
          {pct}%
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CategoryCard;
