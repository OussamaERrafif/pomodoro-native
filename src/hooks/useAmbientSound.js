import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useAppStore } from '../store';

// Add looping .mp3 files to assets/sounds/ and map them here.
// e.g. rain: require('../../assets/sounds/rain.mp3')
export const SOUND_SOURCES = {
  rain:   null,
  cafe:   null,
  white:  null,
  forest: null,
  fire:   null,
  brown:  null,
};

export function useAmbientSound() {
  const ambientSound = useAppStore((s) => s.ambientSound);
  const ambientVolume = useAppStore((s) => s.ambientVolume);
  const isRunning = useAppStore((s) => s.isRunning);

  const activeSource = ambientSound !== 'none' ? (SOUND_SOURCES[ambientSound] ?? null) : null;

  // useAudioPlayer automatically disposes and recreates when activeSource changes
  const player = useAudioPlayer(activeSource);

  // Configure audio session once on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch(() => {});
  }, []);

  // Enable looping whenever a new player is created
  useEffect(() => {
    if (!activeSource) return;
    player.loop = true;
  }, [player, activeSource]);

  // Play / pause in sync with the timer
  useEffect(() => {
    if (!activeSource) return;
    if (isRunning) {
      player.play();
    } else {
      player.pause();
    }
  }, [isRunning, activeSource, player]);

  // Live volume updates
  useEffect(() => {
    if (!activeSource) return;
    player.volume = ambientVolume;
  }, [ambientVolume, player, activeSource]);
}
