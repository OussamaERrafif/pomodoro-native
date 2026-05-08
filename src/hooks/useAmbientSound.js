import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useAppStore } from '../store';

// Add looping .mp3 files to assets/sounds/ and map them here.
// e.g. rain: require('../../assets/sounds/rain.mp3')
const SOUND_SOURCES = {
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

  const soundRef = useRef(null);
  const loadedIdRef = useRef(null);

  // Configure audio session once
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch(() => {});
  }, []);

  // Load / unload sound when selection changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Unload previous
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        loadedIdRef.current = null;
      }

      if (ambientSound === 'none') return;

      const source = SOUND_SOURCES[ambientSound];
      if (!source) return; // audio file not yet added

      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          isLooping: true,
          volume: ambientVolume,
          shouldPlay: isRunning,
        });
        if (cancelled) {
          await sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
        loadedIdRef.current = ambientSound;
      } catch (_) {}
    }

    load();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientSound]);

  // Play / pause when timer starts or stops
  useEffect(() => {
    if (!soundRef.current) return;
    if (isRunning) {
      soundRef.current.playAsync().catch(() => {});
    } else {
      soundRef.current.pauseAsync().catch(() => {});
    }
  }, [isRunning]);

  // Update volume live
  useEffect(() => {
    if (!soundRef.current) return;
    soundRef.current.setVolumeAsync(ambientVolume).catch(() => {});
  }, [ambientVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);
}
