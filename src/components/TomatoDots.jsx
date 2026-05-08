import React from 'react';
import { View, StyleSheet } from 'react-native';

export function TomatoDots({ done = 0, total = 4, colors, size = 8 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: i < done ? colors.focus : colors.line,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    marginRight: 2,
  },
});
