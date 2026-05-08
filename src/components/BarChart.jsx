import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BarChart({ data, colors, height = 140, accentColor }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barColor = accentColor || colors.focus;

  return (
    <View style={[styles.container, { height }]}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / max) * (height - 28), 4);
        return (
          <View key={i} style={styles.col}>
            <View style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barH,
                    backgroundColor: d.today ? barColor : `${barColor}55`,
                    shadowColor: d.today ? barColor : 'transparent',
                    shadowOpacity: d.today ? 0.35 : 0,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: d.today ? 4 : 0,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: d.today ? colors.ink : colors.soft,
                  fontWeight: d.today ? '600' : '500',
                },
              ]}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingTop: 12,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: 28,
    borderRadius: 8,
  },
  label: {
    fontSize: 10,
  },
});
