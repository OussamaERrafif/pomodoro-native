import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { HomeIcon, TaskIcon, ChartIcon, CogIcon } from './Icon';

const TABS = [
  { key: 'index', label: 'Focus', Icon: HomeIcon },
  { key: 'tasks', label: 'Tasks', Icon: TaskIcon },
  { key: 'stats', label: 'Stats', Icon: ChartIcon },
  { key: 'settings', label: 'Settings', Icon: CogIcon },
];

export function CustomTabBar({ state, descriptors, navigation }) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.key === route.name) || TABS[index];
        if (!tab) return null;

        const isFocused = state.index === index;
        const color = isFocused ? colors.focus : colors.soft;
        const { Icon } = tab;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tab}
          >
            <Icon size={22} color={color} strokeWidth={isFocused ? 2 : 1.7} />
            <Text style={[styles.label, { color, fontWeight: isFocused ? '600' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
  },
});
