import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryIcon, getCategoryLabel } from "@/components/CategoryIcon";
import { useBattery } from "@/context/BatteryContext";
import colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { DeviceCategory } from "@/types";

const CATEGORIES: DeviceCategory[] = [
  "cameras",
  "lights",
  "audio",
  "drones",
  "other",
];

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barMeta}>
        <View style={[styles.barDot, { backgroundColor: color }]} />
        <Text style={[styles.barLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.barCount, { color: color }]}>{count}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { flex: pct, backgroundColor: color }]} />
        <View style={{ flex: 1 - pct }} />
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { devices, batteries } = useBattery();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const stats = useMemo(() => {
    const total = batteries.length;
    const charged = batteries.filter((b) => b.status === "charged").length;
    const charging = batteries.filter((b) => b.status === "charging").length;
    const discharged = batteries.filter(
      (b) => b.status === "discharged",
    ).length;
    const readyPct = total > 0 ? Math.round((charged / total) * 100) : 0;
    const byCat = CATEGORIES.map((cat) => {
      const catDevices = devices.filter((d) => d.category === cat);
      const catBatteries = batteries.filter((b) =>
        catDevices.some((d) => d.id === b.deviceId),
      );
      return {
        category: cat,
        deviceCount: catDevices.length,
        batteryCount: catBatteries.length,
        charged: catBatteries.filter((b) => b.status === "charged").length,
        charging: catBatteries.filter((b) => b.status === "charging").length,
        discharged: catBatteries.filter((b) => b.status === "discharged")
          .length,
      };
    }).filter((c) => c.deviceCount > 0);
    return { total, charged, charging, discharged, readyPct, byCat };
  }, [devices, batteries]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 12, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO readiness */}
      <View
        style={[
          styles.heroCard,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={[styles.heroBorder]} />
        <View style={styles.heroInner}>
          <Text
            style={[
              styles.heroNum,
              {
                color: stats.readyPct > 50 ? colors.charged : colors.discharged,
              },
            ]}
          >
            {stats.readyPct}
            <Text style={styles.heroPct}>%</Text>
          </Text>
          <Text style={[styles.heroLabel, { color: colors.mutedForeground }]}>
            {t.gearReady}
          </Text>
        </View>
        <View style={[styles.heroTrack]}>
          <View
            style={[
              styles.heroFill,
              {
                flex: stats.readyPct / 100,
                backgroundColor:
                  stats.readyPct > 50 ? colors.charged : colors.discharged,
              },
            ]}
          />
          <View style={{ flex: 1 - stats.readyPct / 100 }} />
        </View>
      </View>

      {/* 4 STAT BOXES */}
      <View style={styles.statGrid}>
        {[
          {
            label: t.statDevices,
            value: devices.length,
            color: colors.primary,
          },
          {
            label: t.statBatteries,
            value: stats.total,
            color: colors.foreground,
          },
          { label: t.statReady, value: stats.charged, color: colors.charged },
          {
            label: t.statNeedsCharge,
            value: stats.discharged,
            color: colors.discharged,
          },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.statBox,
              { backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.statNum, { color: item.color }]}>
              {item.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {item.label.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      {/* STATUS BREAKDOWN */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card},
        ]}
      >
        <View style={[styles.sectionAccent]} />
        <View style={styles.sectionContent}>
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            {t.statusBreakdown}
          </Text>
          {stats.total === 0 ? (
            <Text style={[styles.emptyNote, { color: colors.mutedForeground }]}>
              {t.noBatteriesTracked}
            </Text>
          ) : (
            <View style={styles.barList}>
              <BarRow
                label={t.statusCharged}
                count={stats.charged}
                total={stats.total}
                color={colors.charged}
              />
              <BarRow
                label={t.statusCharging}
                count={stats.charging}
                total={stats.total}
                color={colors.charging}
              />
              <BarRow
                label={t.statusDischarged}
                count={stats.discharged}
                total={stats.total}
                color={colors.discharged}
              />
            </View>
          )}
        </View>
      </View>

      {/* BY CATEGORY */}
      {stats.byCat.length > 0 && (
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card},
          ]}
        >
          <View style={[styles.sectionAccent]} />
          <View style={styles.sectionContent}>
            <Text
              style={[styles.sectionTitle, { color: colors.mutedForeground }]}
            >
              {t.byCategory}
            </Text>
            <View style={styles.catList}>
              {stats.byCat.map((cat) => (
                <View key={cat.category} style={styles.catRow}>
                  <CategoryIcon
                    category={cat.category}
                    size={15}
                    showBackground={false}
                  />
                  <View style={styles.catInfo}>
                    <View style={styles.catTitleRow}>
                      <Text
                        style={[styles.catName, { color: colors.foreground }]}
                      >
                        {getCategoryLabel(cat.category).toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.catCounts,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {t.catDeviceCount(cat.deviceCount)} ·{" "}
                        {t.catBatteryCount(cat.batteryCount)}
                      </Text>
                    </View>
                    {cat.batteryCount > 0 && (
                      <View
                        style={[
                          styles.miniBar,
                          { backgroundColor: colors.border },
                        ]}
                      >
                        {cat.charged > 0 && (
                          <View
                            style={{
                              flex: cat.charged,
                              backgroundColor: colors.charged,
                              height: "100%",
                            }}
                          />
                        )}
                        {cat.charging > 0 && (
                          <View
                            style={{
                              flex: cat.charging,
                              backgroundColor: colors.charging,
                              height: "100%",
                            }}
                          />
                        )}
                        {cat.discharged > 0 && (
                          <View
                            style={{
                              flex: cat.discharged,
                              backgroundColor: colors.discharged,
                              height: "100%",
                            }}
                          />
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerBlock: { gap: -4 },
  headerTitle1: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 42,
  },
  headerTitle2: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    lineHeight: 24,
  },
  heroCard: {
    borderRadius: 14,
    borderWidth: 0,
    overflow: "hidden",
  },
  heroBorder: { height: 3 },
  heroInner: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
  },
  heroNum: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    letterSpacing: -3,
    lineHeight: 76,
  },
  heroPct: { fontSize: 36, letterSpacing: -1 },
  heroLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  heroTrack: { height: 4, flexDirection: "row", margin: 0 },
  heroFill: { height: "100%" },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    gap: 6,
  },
  statNum: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  section: {
    borderRadius: 12,
    borderWidth: 0,
    overflow: "hidden",
    flexDirection: "row",
  },
  sectionAccent: { width: 3 },
  sectionContent: { flex: 1, padding: 16, gap: 14 },
  sectionTitle: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  emptyNote: { fontSize: 14, fontFamily: "Inter_400Regular" },
  barList: { gap: 12 },
  barRow: { gap: 8 },
  barMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  barDot: { width: 7, height: 7, borderRadius: 3.5 },
  barLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  barCount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  barTrack: {
    height: 5,
    borderRadius: 3,
    flexDirection: "row",
    overflow: "hidden",
  },
  barFill: { borderRadius: 3 },
  catList: { gap: 14 },
  catRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  catInfo: { flex: 1, gap: 7 },
  catTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catName: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  catCounts: { fontSize: 11, fontFamily: "Inter_400Regular" },
  miniBar: {
    height: 4,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
});
