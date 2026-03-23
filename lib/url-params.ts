import type { StarConfig, StarType, FillType, StrokeDash, FillRule, AltLengthPattern, GradientDirection } from '@/types/star';
import { DEFAULT_CONFIG } from '@/types/star';

// Short key map to keep URLs concise
const KEY_MAP = {
  starType: 't',
  outerRadius: 'r',
  innerRadiusRatio: 'ir',
  rotation: 'rot',
  fillType: 'ft',
  fillColor: 'fc',
  gradientColors: 'gc',
  gradientDirection: 'gd',
  fillOpacity: 'fo',
  strokeColor: 'sc',
  strokeWidth: 'sw',
  strokeDash: 'sd',
  bgColor: 'bg',
  curveIntensity: 'ci',
  cornerRadius: 'cr',
  fillRule: 'fr',
  showInnerPolygon: 'sip',
  innerPolygonColor: 'ipc',
  glowColor: 'glc',
  glowRadius: 'glr',
  shadowBlur: 'shb',
  shadowColor: 'shc',
  shadowOffsetX: 'shx',
  shadowOffsetY: 'shy',
  altLengthPattern: 'alp',
  altLengthRatio: 'alr',
  spiralTwist: 'st',
  petalWidth: 'pw',
  petalCurve: 'pc',
  fractalDepth: 'fd',
  interlaceGap: 'ig',
  exportWidth: 'ew',
  exportHeight: 'eh',
} as const;

const REVERSE_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k]),
) as Record<string, keyof StarConfig>;

export function configToParams(config: StarConfig): URLSearchParams {
  const params = new URLSearchParams();
  const def = DEFAULT_CONFIG;

  const set = (key: keyof StarConfig, shortKey: string) => {
    const val = config[key];
    const defVal = def[key];

    if (Array.isArray(val)) {
      const joined = (val as string[]).join(',');
      const defJoined = (defVal as string[]).join(',');
      if (joined !== defJoined) params.set(shortKey, joined);
    } else if (val !== defVal) {
      params.set(shortKey, String(val));
    }
  };

  for (const [longKey, shortKey] of Object.entries(KEY_MAP)) {
    set(longKey as keyof StarConfig, shortKey);
  }

  return params;
}

export function paramsToConfig(params: URLSearchParams): StarConfig {
  const config: StarConfig = { ...DEFAULT_CONFIG };

  for (const [shortKey, value] of params.entries()) {
    const longKey = REVERSE_MAP[shortKey];
    if (!longKey) continue;

    switch (longKey) {
      case 'starType':
        config.starType = value as StarType;
        break;
      case 'fillType':
        config.fillType = value as FillType;
        break;
      case 'strokeDash':
        config.strokeDash = value as StrokeDash;
        break;
      case 'fillRule':
        config.fillRule = value as FillRule;
        break;
      case 'altLengthPattern':
        config.altLengthPattern = value as AltLengthPattern;
        break;
      case 'gradientDirection':
        config.gradientDirection = value as GradientDirection;
        break;
      case 'gradientColors':
        config.gradientColors = value.split(',').filter(Boolean);
        break;
      case 'showInnerPolygon':
        config.showInnerPolygon = value === 'true';
        break;
      case 'outerRadius':
      case 'innerRadiusRatio':
      case 'rotation':
      case 'fillOpacity':
      case 'strokeWidth':
      case 'curveIntensity':
      case 'cornerRadius':
      case 'glowRadius':
      case 'shadowBlur':
      case 'shadowOffsetX':
      case 'shadowOffsetY':
      case 'altLengthRatio':
      case 'spiralTwist':
      case 'petalWidth':
      case 'petalCurve':
      case 'fractalDepth':
      case 'interlaceGap':
      case 'exportWidth':
      case 'exportHeight':
        (config as unknown as Record<string, unknown>)[longKey] = parseFloat(value);
        break;
      default:
        (config as unknown as Record<string, unknown>)[longKey] = value;
    }
  }

  return config;
}
