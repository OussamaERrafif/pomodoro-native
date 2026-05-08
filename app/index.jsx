import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store';

export default function Root() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  return <Redirect href={hasCompletedOnboarding ? '/(tabs)' : '/onboarding'} />;
}
