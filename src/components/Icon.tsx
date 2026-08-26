import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Set de íconos de línea extraído 1:1 de los mockups de Mawis (paw, store,
 * nav, etc.). Cada ícono es "stroke" (contorno) salvo los marcados como
 * filled (estrella, insignia verificada, corazón), donde `color` pinta el
 * relleno en vez del trazo.
 */
export type IconName =
  | 'paw'
  | 'store'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'grid'
  | 'gridSettings'
  | 'house'
  | 'search'
  | 'shieldAlert'
  | 'user'
  | 'alertCircle'
  | 'syringe'
  | 'locationPin'
  | 'star'
  | 'starOutline'
  | 'scissors'
  | 'phone'
  | 'navigation'
  | 'share'
  | 'checkBadge'
  | 'heart'
  | 'camera'
  | 'calendar'
  | 'chatBubble'
  | 'eye'
  | 'trendingUp'
  | 'plus'
  | 'bell';

const FILLED_ICONS = new Set<IconName>(['star', 'checkBadge']);

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = '#1E2823', strokeWidth = 1.8 }: IconProps) {
  const filled = FILLED_ICONS.has(name);
  const common = filled
    ? { fill: color, stroke: 'none' }
    : { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderIcon(name, common)}
    </Svg>
  );
}

function renderIcon(name: IconName, common: Record<string, unknown>) {
  switch (name) {
    case 'paw':
      return (
        <>
          <Circle cx={7} cy={8} r={1.6} {...common} />
          <Circle cx={11.5} cy={5.6} r={1.6} {...common} />
          <Circle cx={16} cy={8} r={1.6} {...common} />
          <Path
            d="M11.5 10.2c-3.6 0-6 2.4-6 5 0 1.9 1.6 3 3.4 2.3.9-.3 1.7-.3 2.6 0 1.8.7 3.4-.4 3.4-2.3 0-2.6-2.4-5-6-5z"
            {...common}
          />
        </>
      );
    case 'store':
      return (
        <>
          <Path d="M4 10l1.2-5h13.6L20 10" {...common} />
          <Path d="M4 10h16v9H4z" {...common} />
          <Path d="M9 19v-5h6v5" {...common} />
        </>
      );
    case 'chevronRight':
      return <Path d="M9 6l6 6-6 6" {...common} />;
    case 'chevronLeft':
      return <Path d="M15 6l-6 6 6 6" {...common} />;
    case 'chevronDown':
      return <Path d="M6 9l6 6 6-6" {...common} />;
    case 'grid':
      return (
        <>
          <Rect x={3.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
        </>
      );
    case 'gridSettings':
      return (
        <>
          <Rect x={3} y={3} width={6} height={6} rx={1} {...common} />
          <Rect x={15} y={3} width={6} height={6} rx={1} {...common} />
          <Rect x={3} y={15} width={6} height={6} rx={1} {...common} />
          <Path d="M15 15h3v3M21 15v3h-3M15 21h3" {...common} />
        </>
      );
    case 'house':
      return (
        <>
          <Path d="M4 11l8-7 8 7" {...common} />
          <Path d="M6 10v10h12V10" {...common} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} {...common} />
          <Path d="M21 21l-4.3-4.3" {...common} />
        </>
      );
    case 'shieldAlert':
      return (
        <>
          <Path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...common} />
          <Path d="M12 9v4M12 16h.01" {...common} />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8} r={3.2} {...common} />
          <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" {...common} />
        </>
      );
    case 'alertCircle':
      return (
        <>
          <Path d="M12 8v5M12 16h.01" {...common} />
          <Circle cx={12} cy={12} r={9} {...common} />
        </>
      );
    case 'syringe':
      return (
        <Path
          d="M18 6l-3.5 3.5M4 20l4.5-4.5M9 15l-3 3-2-2 3-3M15 9l3-3-2-2-3 3M12.5 6.5l5 5"
          {...common}
        />
      );
    case 'locationPin':
      return (
        <>
          <Path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" {...common} />
          <Circle cx={12} cy={10} r={2.4} {...common} />
        </>
      );
    case 'star':
      return (
        <Path
          d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8-6.2-3.7-6.2 3.7 1.6-6.8-5.2-4.6 6.9-.7z"
          {...common}
        />
      );
    case 'starOutline':
      return (
        <Path
          d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8-6.2-3.7-6.2 3.7 1.6-6.8-5.2-4.6 6.9-.7z"
          {...common}
          fill="none"
        />
      );
    case 'scissors':
      return (
        <>
          <Path d="M6 4l1.5 3M18 4l-1.5 3" {...common} />
          <Circle cx={12} cy={13} r={6.2} {...common} />
          <Path d="M9.5 13l1.8 1.8L15 11" {...common} />
        </>
      );
    case 'phone':
      return (
        <Path
          d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 8.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.8 2z"
          {...common}
        />
      );
    case 'navigation':
      return <Path d="M3 11l18-7-7 18-2.5-7.5z" {...common} />;
    case 'share':
      return (
        <>
          <Circle cx={18} cy={5} r={2.4} {...common} />
          <Circle cx={6} cy={12} r={2.4} {...common} />
          <Circle cx={18} cy={19} r={2.4} {...common} />
          <Path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" {...common} />
        </>
      );
    case 'checkBadge':
      return (
        <>
          <Circle cx={12} cy={12} r={10} {...common} />
          <Path
            d="M8 12.2l2.6 2.6L16.5 9"
            fill="none"
            stroke="#FBF8F4"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'heart':
      return (
        <Path
          d="M20.8 8.6c0 4.4-8.8 10-8.8 10s-8.8-5.6-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8z"
          {...common}
        />
      );
    case 'camera':
      return (
        <>
          <Path
            d="M4 8a2 2 0 0 1 2-2h1.2l1-1.6h5.6l1 1.6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
            {...common}
          />
          <Circle cx={12} cy={12.5} r={3.2} {...common} />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect x={4} y={5} width={16} height={15} rx={2.5} {...common} />
          <Path d="M8 3v4M16 3v4M4 10h16" {...common} />
        </>
      );
    case 'chatBubble':
      return <Path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L4 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5z" {...common} />;
    case 'eye':
      return (
        <>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...common} />
          <Circle cx={12} cy={12} r={3} {...common} />
        </>
      );
    case 'trendingUp':
      return (
        <>
          <Path d="M3 17l6-6 4 4 8-8" {...common} />
          <Path d="M15 6h6v6" {...common} />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...common} />;
    case 'bell':
      return (
        <>
          <Path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" {...common} />
          <Path d="M10 19a2 2 0 0 0 4 0" {...common} />
        </>
      );
    default:
      return null;
  }
}
