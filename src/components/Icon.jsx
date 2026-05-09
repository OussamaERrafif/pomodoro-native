import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

function Icon({ d, size = 20, color = 'currentColor', strokeWidth = 1.7, fill = 'none', children }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children || (typeof d === 'string' ? <Path d={d} /> : d)}
    </Svg>
  );
}

export const PlayIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M7 5v14l12-7z" fill={color} stroke="none" />
  </Svg>
);

export const PauseIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6.5" y="5" width="3.5" height="14" rx="1" fill={color} stroke="none" />
    <Rect x="14" y="5" width="3.5" height="14" rx="1" fill={color} stroke="none" />
  </Svg>
);

export const ResetIcon = ({ size = 20, color = '#000', strokeWidth = 1.8 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
);

export const SkipIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 5l9 7-9 7z" fill={color} stroke="none" />
    <Rect x="15" y="5" width="2.5" height="14" rx="1" fill={color} stroke="none" />
  </Svg>
);

export const PlusIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M12 5v14M5 12h14" />
);

export const CheckIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M5 12.5l4.5 4.5L19 7" />
);

export const XIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M6 6l12 12M18 6L6 18" />
);

export const ChevRightIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M9 6l6 6-6 6" />
);

export const ChevLeftIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M15 6l-6 6 6 6" />
);

export const ChevDownIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M6 9l6 6 6-6" />
);

export const BellIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0" />
);

export const MoonIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
);

export const SunIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </Svg>
);

export const FlameIcon = ({ size = 20, color = '#000', filled = false }) => (
  <Icon size={size} color={color} strokeWidth={filled ? 0 : 1.7} fill={filled ? color : 'none'}
    d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 0-3 0-6 0-8z" />
);

export const LeafIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 3c-7 0-13 4-15 11-1 4 0 7 0 7s3-1 7-2c7-2 11-7 11-15-1 0-2 0-3 0z" />
    <Path d="M9 17c4-3 7-6 9-10" />
  </Svg>
);

export const ListIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
);

export const ChartIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 21h18M7 21V10M12 21V4M17 21v-7" />
);

export const CogIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </Svg>
);

export const HomeIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />
);

export const TaskIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
);

export const EditIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
);

export const TrashIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
);

export const RainIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M16 13a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1A4 4 0 0 0 6 13M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
);

export const CafeIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM17 9h2a2 2 0 0 1 0 4h-2M6 1v3M10 1v3M14 1v3" />
);

export const WaveIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
);

export const FireIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 0-3 0-6 0-8z" />
);

export const TargetIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
  </Svg>
);

export const BookIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
);

export const BriefIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
);

export const HeartIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
);

export const ZapIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
);

export const ShieldIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
);

export const ArrowIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M5 12h14M13 5l7 7-7 7" />
);

export const MicIcon = ({ size = 20, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="9" y="2" width="6" height="12" rx="3" fill={color} stroke="none" />
    <Path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
  </Svg>
);

export const SparkleIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8L5 17zM19 2l.6 1.4L21 4l-1.4.6L19 6l-.6-1.4L17 4l1.4-.6L19 2z" />
);

export const ChatIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
);

export const SendIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Icon size={size} color={color} strokeWidth={strokeWidth} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
);

export const SpinnerIcon = ({ size = 20, color = '#000', strokeWidth = 1.7 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round">
    <Path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    <Circle cx="12" cy="12" r="3" fill={color} stroke="none" />
  </Svg>
);
