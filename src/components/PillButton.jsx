import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export function PillButton({
  children, onPress, colors, primary = false, ghost = false,
  size = 'md', style, disabled = false,
}) {
  const h = size === 'sm' ? 36 : size === 'lg' ? 56 : 46;
  const fontSize = size === 'lg' ? 16 : 14;
  const px = Math.round(h * 0.45);

  let bg, textColor, borderColor;
  if (primary) {
    bg = colors.ink;
    textColor = colors.bg;
    borderColor = 'transparent';
  } else if (ghost) {
    bg = 'transparent';
    textColor = colors.ink;
    borderColor = colors.line;
  } else {
    bg = colors.surface;
    textColor = colors.ink;
    borderColor = 'transparent';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          height: h,
          borderRadius: h,
          paddingHorizontal: px,
          backgroundColor: bg,
          borderWidth: ghost ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          shadowColor: primary ? 'transparent' : '#000',
          shadowOpacity: primary ? 0 : 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: primary ? 0 : 2,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{children}</Text>
      ) : (
        <View style={styles.inner}>{children}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.15,
  },
});
