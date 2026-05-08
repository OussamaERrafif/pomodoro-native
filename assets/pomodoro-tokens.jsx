// pomodoro-tokens.jsx — design system tokens (palettes, type, shadows)

const PALETTES = {
  sunset: {
    name: 'Sunset',
    swatch: ['#E8754A', '#3A1E3F', '#F7EFE3'],
    light: {
      bg: '#F7EFE3', surface: '#FFFFFF', surfaceAlt: '#FBF4E9', card: '#FFFFFF',
      ink: '#2A1820', mute: '#6B5560', soft: '#A89A9F', line: 'rgba(58,30,63,0.08)',
      focus: '#E8754A', focusSoft: '#F4A37C', breakC: '#8FAE8B', breakSoft: '#B8CCB4',
      accent: '#3A1E3F', warm: '#FCE3D2', plum: '#3A1E3F',
    },
    dark: {
      bg: '#1A0E1F', surface: '#26172C', surfaceAlt: '#2F1D36', card: '#2F1D36',
      ink: '#F7EFE3', mute: '#C7B6BD', soft: '#8A7882', line: 'rgba(247,239,227,0.08)',
      focus: '#F08D5E', focusSoft: '#E8754A', breakC: '#A8C4A2', breakSoft: '#7A9A77',
      accent: '#F4A37C', warm: '#3A2235', plum: '#F4A37C',
    },
  },
  clay: {
    name: 'Clay',
    swatch: ['#C45A3F', '#2D2A26', '#EDE4D3'],
    light: {
      bg: '#EDE4D3', surface: '#FFFFFF', surfaceAlt: '#F5ECDB', card: '#FFFFFF',
      ink: '#2D2A26', mute: '#6E665C', soft: '#A39788', line: 'rgba(45,42,38,0.08)',
      focus: '#C45A3F', focusSoft: '#E08868', breakC: '#7A8C6E', breakSoft: '#A8B89C',
      accent: '#2D2A26', warm: '#F5DCC9', plum: '#2D2A26',
    },
    dark: {
      bg: '#1C1814', surface: '#26211C', surfaceAlt: '#2E2822', card: '#2E2822',
      ink: '#EDE4D3', mute: '#BFB29F', soft: '#857A6C', line: 'rgba(237,228,211,0.08)',
      focus: '#E07A5F', focusSoft: '#C45A3F', breakC: '#9DB096', breakSoft: '#7A8C6E',
      accent: '#E07A5F', warm: '#3A2E26', plum: '#E07A5F',
    },
  },
  bloom: {
    name: 'Bloom',
    swatch: ['#D6557A', '#2B1F4F', '#F5EFE6'],
    light: {
      bg: '#F5EFE6', surface: '#FFFFFF', surfaceAlt: '#FAF4EB', card: '#FFFFFF',
      ink: '#2B1F4F', mute: '#6A5F8A', soft: '#A097BD', line: 'rgba(43,31,79,0.08)',
      focus: '#D6557A', focusSoft: '#EE8DA8', breakC: '#7CA3B8', breakSoft: '#AEC8D6',
      accent: '#2B1F4F', warm: '#F8D6E0', plum: '#2B1F4F',
    },
    dark: {
      bg: '#15102A', surface: '#1F1838', surfaceAlt: '#28204A', card: '#28204A',
      ink: '#F5EFE6', mute: '#BDB2D4', soft: '#8278A0', line: 'rgba(245,239,230,0.08)',
      focus: '#EE8DA8', focusSoft: '#D6557A', breakC: '#9CC0D2', breakSoft: '#7CA3B8',
      accent: '#EE8DA8', warm: '#3A2540', plum: '#EE8DA8',
    },
  },
  forest: {
    name: 'Forest',
    swatch: ['#D9853B', '#1F2E1A', '#EFE9DA'],
    light: {
      bg: '#EFE9DA', surface: '#FFFFFF', surfaceAlt: '#F5EFE0', card: '#FFFFFF',
      ink: '#1F2E1A', mute: '#5A6A55', soft: '#8A9A85', line: 'rgba(31,46,26,0.08)',
      focus: '#D9853B', focusSoft: '#E8A56A', breakC: '#5C7A52', breakSoft: '#9BB590',
      accent: '#1F2E1A', warm: '#F5DCBE', plum: '#1F2E1A',
    },
    dark: {
      bg: '#121A0F', surface: '#1A2415', surfaceAlt: '#22301C', card: '#22301C',
      ink: '#EFE9DA', mute: '#B5C0A8', soft: '#7A8870', line: 'rgba(239,233,218,0.08)',
      focus: '#E8A56A', focusSoft: '#D9853B', breakC: '#8FAE7C', breakSoft: '#5C7A52',
      accent: '#E8A56A', warm: '#3A2E1F', plum: '#E8A56A',
    },
  },
};

const FONT_DISPLAY = '"Instrument Serif", "Cormorant Garamond", Georgia, serif';
const FONT_UI = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

function getTokens(paletteId, mode) {
  const p = PALETTES[paletteId] || PALETTES.sunset;
  return p[mode] || p.light;
}

Object.assign(window, { PALETTES, FONT_DISPLAY, FONT_UI, FONT_MONO, getTokens });
