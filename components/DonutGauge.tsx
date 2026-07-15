import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import colors from '@/constants/colors';

interface DonutGaugeProps {
  charged: number;
  charging: number;
  discharged: number;
  size?: number;
}

const W = 180;
const H = 104;
const CX = W / 2;
const CY = H;       // center at bottom edge so the upper semi-circle fills the viewport
const R_OUT = 88;
const R_IN = 58;

function xy(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number): string {
  const span = endDeg - startDeg;
  if (Math.abs(span) < 0.5) return '';
  const p1 = xy(startDeg, R_OUT);
  const p2 = xy(endDeg, R_OUT);
  const p3 = xy(endDeg, R_IN);
  const p4 = xy(startDeg, R_IN);
  const large = span > 180 ? 1 : 0;
  return [
    `M${p1.x},${p1.y}`,
    `A${R_OUT},${R_OUT},0,${large},1,${p2.x},${p2.y}`,
    `L${p3.x},${p3.y}`,
    `A${R_IN},${R_IN},0,${large},0,${p4.x},${p4.y}`,
    'Z',
  ].join(' ');
}

export function DonutGauge({ charged, charging, discharged }: DonutGaugeProps) {
  const total = charged + charging + discharged;
  const readyPct = total > 0 ? Math.round((charged / total) * 100) : 0;

  const chargedFrac = total > 0 ? charged / total : 0;
  const chargingFrac = total > 0 ? charging / total : 0;

  const GAP = total > 0 ? 1.5 : 0; // small degree gap between segments

  let cursor = 180;
  const chargedEnd = cursor + chargedFrac * 180;
  const chargingStart = chargedEnd + (charged > 0 && charging > 0 ? GAP : 0);
  const chargingEnd = chargingStart + chargingFrac * 180;
  const dischargedStart = chargingEnd + (charging > 0 && discharged > 0 ? GAP : 0);

  return (
    <View style={styles.container}>
      <Svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={styles.svg}
      >
        {/* Track background */}
        <Path d={arcPath(180, 360)} fill={colors.border} />

        {/* Charged segment */}
        {charged > 0 && (
          <Path d={arcPath(cursor, chargedEnd)} fill={colors.charged} />
        )}

        {/* Charging segment */}
        {charging > 0 && (
          <Path d={arcPath(chargingStart, chargingEnd)} fill={colors.charging} />
        )}

        {/* Discharged segment */}
        {discharged > 0 && (
          <Path d={arcPath(dischargedStart, 360)} fill={colors.discharged} />
        )}
      </Svg>

      {/* Center overlay */}
      <View style={styles.centerOverlay} pointerEvents="none">
        <Text style={[styles.pctNum, { color: colors.foreground }]}>
          {readyPct}
          <Text style={[styles.pctSign, { color: colors.mutedForeground }]}>%</Text>
        </Text>
        <Text style={[styles.pctLabel, { color: colors.mutedForeground }]}>
          READY
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: W,
    height: H,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    
    alignItems: 'center',
  },
  pctNum: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
    lineHeight: 28,
  },
  pctSign: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 5,
  },
  pctLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    marginTop: 1,
  },
});
