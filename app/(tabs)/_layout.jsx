import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../src/components';
import { useAmbientSound } from '../../src/hooks/useAmbientSound';
import { useSmartNotifications } from '../../src/hooks/useSmartNotifications';

function AmbientSoundManager() {
  useAmbientSound();
  return null;
}

function SmartNotificationsManager() {
  useSmartNotifications();
  return null;
}

export default function TabsLayout() {
  return (
    <>
      <AmbientSoundManager />
      <SmartNotificationsManager />
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
