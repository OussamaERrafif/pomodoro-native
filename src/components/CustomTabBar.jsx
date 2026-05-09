import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { HomeIcon, TaskIcon, ChartIcon, CogIcon } from './Icon';

const TABS = [
  { key: 'index', label: 'Focus', Icon: HomeIcon },
  { key: 'tasks', label: 'Tasks', Icon: TaskIcon },
  { key: 'stats', label: 'Stats', Icon: ChartIcon },
  { key: 'settings', label: 'Settings', Icon: CogIcon },
];

function TabItem({ tab, isFocused, colors, onPress }) {
  const pressScale = useSharedValue(1);
  const dotScale = useSharedValue(isFocused ? 1 : 0);
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);
  const labelWeight = isFocused ? '600' : '500';

  useEffect(() => {
    dotScale.value = withSpring(isFocused ? 1 : 0, { damping: 14, stiffness: 220 });
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotOpacity.value,
  }));

  const { Icon } = tab;
  const color = isFocused ? colors.focus : colors.soft;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { pressScale.value = withSpring(0.84, { damping: 15, stiffness: 500 }); }}
      onPressOut={() => { pressScale.value = withSpring(1, { damping: 12, stiffness: 350 }); }}
      style={styles.tab}
    >
      <Animated.View style={[styles.tabInner, pressStyle]}>
        <Animated.View style={[styles.dot, { backgroundColor: colors.focus }, dotStyle]} />
        <Icon size={22} color={color} strokeWidth={isFocused ? 2 : 1.7} />
        <Text style={[styles.label, { color, fontWeight: labelWeight }]}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

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

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            tab={tab}
            isFocused={isFocused}
            colors={colors}
            onPress={onPress}
          />
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
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 1,
  },
  label: {
    fontSize: 10,
  },
});
