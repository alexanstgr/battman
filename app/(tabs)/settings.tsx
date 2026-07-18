import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import Social from "@/components/Social";
import Logo from "@/components/Logo";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/context/LanguageContext";

import English from "@/assets/flags/en.svg";
import Greek from "@/assets/flags/gr.svg";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const t = useTranslation();

  const { language, setLanguage } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const LANGS: { value: Language; label: string; flag: string }[] = [
    { value: "en", label: t.langEnglish, flag: "en" },
    { value: "el", label: t.langGreek, flag: "el" },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 12, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerBlock}>
        <Logo />
      </View>

      {/* LANGUAGE */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {t.languageSection}
        </Text>
        <View style={styles.langRow}>
          {LANGS.map((lang) => {
            const isActive = language === lang.value;
            return (
              <Pressable
                key={lang.value}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  await setLanguage(lang.value);
                }}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                    flex: 1,
                  },
                ]}
              >
                {lang.flag == "en" ? (
                  <English width={24} height={24} />
                ) : (
                  <Greek width={24} height={24} />
                )}
                <Text
                  style={[
                    styles.langLabel,
                    {
                      color: isActive ? colors.primary : colors.mutedForeground,
                    },
                  ]}
                >
                  {lang.label}
                </Text>
                {isActive && (
                  <View
                    style={[
                      styles.langCheck,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Feather
                      name="check"
                      size={10}
                      color={colors.primaryForeground}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ABOUT */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {t.about}
        </Text>
        <View style={[styles.aboutCard, { backgroundColor: colors.card }]}>
          <View style={[styles.aboutAccent]} />

          <View style={styles.aboutContent}>
            <Text style={[styles.aboutName, { color: colors.foreground }]}>
              {t.appName}
            </Text>

            <Text style={[styles.aboutVersion, { color: colors.primary }]}>
              {t.appVersion}
            </Text>

            <Text
              style={[styles.aboutTagline, { color: colors.mutedForeground }]}
            >
              {t.appTagline}
            </Text>

            <Text
              style={[
                styles.developerName,
                { color: "#000000", marginTop: 8, fontWeight: "800" },
              ]}
            >
              {t.developerHeadline}
            </Text>

            <Text style={[styles.developerName, { color: colors.primary }]}>
              {t.developerName}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
              <Social icon="globe" href="https://alexanast.gr" />
              <Social
                icon="mark-github"
                href="https://github.com/alexanstgr/battman"
              />
              <Social icon="mail" href="mailto:alexanstgr@gmail.com" />
            </View>
          </View>
        </View>
      </View>

      {/* TIPS */}
      <View style={[styles.section]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {t.tips}
        </Text>
        <View style={styles.tipList}>
          {[t.tip1, t.tip2, t.tip3, t.tip4].map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Text style={[styles.tipNum, { color: colors.primary }]}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 28 },
  headerBlock: { gap: 0, justifyContent: "center" },

  section: { gap: 7 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  segItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  segLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  langRow: { flexDirection: "row", gap: 10 },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  langFlag: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  langLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  langCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutCard: {
    borderRadius: 14,
    borderColor: colors.cardBorderColor,
    borderWidth: colors.cardBorderWidth,
    overflow: "hidden",
    flexDirection: "row",
  },
  aboutAccent: { width: 3 },
  aboutContent: { flex: 1, padding: 16, gap: 4 },
  aboutName: { fontSize: 16, fontWeight: "700" },
  developerName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  aboutTagline: { fontSize: 13, fontFamily: "Inter_400Regular" },
  aboutVersion: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  tipList: {
    gap: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderColor: colors.cardBorderColor,
    borderWidth: colors.cardBorderWidth,
  },
  tip: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipNum: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginTop: 2,
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
