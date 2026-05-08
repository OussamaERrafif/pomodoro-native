import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../src/components';
import { useAmbientSound } from '../../src/hooks/useAmbientSound';

function AmbientSoundManager() {
  useAmbientSound();
  return null;
}

export default function TabsLayout() {
  return (
    <>
      <AmbientSoundManager />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tasks" />
        <Tabs.Screen name="stats" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </>
  );
}
