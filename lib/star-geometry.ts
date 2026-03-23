import type { StarConfig } from '@/types/star';

const TWO_PI = Math.PI * 2;
const N = 9;

// ── Helpers ──────────────────────────────────────────────────────────────────

function pt(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function fmt(n: number) {
  return n.toFixed(3);
}

function moveTo([x, y]: [number, number]) {
  return `M ${fmt(x)},${fmt(y)}`;
}

function lineTo([x, y]: [number, number]) {
  return `L ${fmt(x)},${fmt(y)}`;
}

function curveTo(cp1: [number, number], cp2: [number, number], end: [number, number]) {
  return `C ${fmt(cp1[0])},${fmt(cp1[1])} ${fmt(cp2[0])},${fmt(cp2[1])} ${fmt(end[0])},${fmt(end[1])}`;
}

/**
 * Perpendicular midpoint control-point for quadratic Bézier.
 * `amount` > 0 curves one way, < 0 the other.
 */
function perpendicularCP(
  a: [number, number],
  b: [number, number],
  amount: number,
): [number, number] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [mx + (-dy / len) * amount, my + (dx / len) * amount];
}

/** Apply quadratic Bézier or straight line between two points */
function edgeTo(from: [number, number], to: [number, number], R: number, intensity: number): string {
  if (intensity === 0) return lineTo(to);
  const offset = R * intensity * 0.3;
  const cp = perpendicularCP(from, to, offset);
  return `Q ${fmt(cp[0])},${fmt(cp[1])} ${fmt(to[0])},${fmt(to[1])}`;
}

// ── {9/2} – true Schläfli unicursal star polygon ─────────────────────────────
// Connects every 2nd vertex on a 9-point circle.
// Visits: 0 → 2 → 4 → 6 → 8 → 1 → 3 → 5 → 7 → 0
function build9_2(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const pts: Array<[number, number]> = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, R, baseRot + (TWO_PI * i) / N),
  );

  const order: number[] = [];
  let cur = 0;
  for (let i = 0; i < N; i++) {
    order.push(cur);
    cur = (cur + 2) % N;
  }

  const ordered = order.map((i) => pts[i]);
  const c = cfg.curveIntensity;
  const parts = [moveTo(ordered[0])];
  for (let i = 1; i < ordered.length; i++) {
    parts.push(edgeTo(ordered[i - 1], ordered[i], R, c));
  }
  parts.push(edgeTo(ordered[ordered.length - 1], ordered[0], R, c));
  parts.push('Z');
  return [parts.join(' ')];
}

// ── {9/4} – true Schläfli unicursal star polygon ─────────────────────────────
// Connects every 4th vertex on a 9-point circle.
// Visits: 0 → 4 → 8 → 3 → 7 → 2 → 6 → 1 → 5 → 0
// This creates a much denser, more intricately wound star than {9/2}.
function build9_4(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const pts: Array<[number, number]> = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, R, baseRot + (TWO_PI * i) / N),
  );

  const order: number[] = [];
  let cur = 0;
  for (let i = 0; i < N; i++) {
    order.push(cur);
    cur = (cur + 4) % N;
  }

  const ordered = order.map((i) => pts[i]);
  const c = cfg.curveIntensity;
  const parts = [moveTo(ordered[0])];
  for (let i = 1; i < ordered.length; i++) {
    parts.push(edgeTo(ordered[i - 1], ordered[i], R, c));
  }
  parts.push(edgeTo(ordered[ordered.length - 1], ordered[0], R, c));
  parts.push('Z');
  return [parts.join(' ')];
}

// ── Triple Triangle {9/3} ─────────────────────────────────────────────────────
// Three equilateral triangles at offsets 0°, 40°, 80° covering all 9 vertices.
function build3Triangles(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const c = cfg.curveIntensity;
  const paths: string[] = [];

  for (let t = 0; t < 3; t++) {
    // Each triangle starts at a different 40°-offset position
    const offset = baseRot + (TWO_PI * t) / N; // 0°, 40°, 80° offset
    const tri: Array<[number, number]> = [
      pt(cx, cy, R, offset),
      pt(cx, cy, R, offset + TWO_PI / 3),
      pt(cx, cy, R, offset + (2 * TWO_PI) / 3),
    ];

    const parts = [moveTo(tri[0])];
    parts.push(edgeTo(tri[0], tri[1], R, c));
    parts.push(edgeTo(tri[1], tri[2], R, c));
    parts.push(edgeTo(tri[2], tri[0], R, c));
    parts.push('Z');
    paths.push(parts.join(' '));
  }

  return paths;
}

// ── Triple Rhombus ────────────────────────────────────────────────────────────
// Three rhombuses (kite shapes) rotated 0°, 40°, 80°.
function build3Rhombuses(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const inner = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const narrowHalf = Math.PI / 12; // 15° half-width for the kite shape
  const c = cfg.curveIntensity;
  const paths: string[] = [];

  for (let t = 0; t < 3; t++) {
    const tipAngle = baseRot + (TWO_PI * t) / N;
    const baseAngle = tipAngle + Math.PI; // opposite side

    const tip = pt(cx, cy, R, tipAngle);
    const left = pt(cx, cy, inner, tipAngle + Math.PI / 2 - narrowHalf);
    const base = pt(cx, cy, inner * 0.4, baseAngle + Math.PI);
    const right = pt(cx, cy, inner, tipAngle - Math.PI / 2 + narrowHalf);

    const parts = [
      moveTo(tip),
      edgeTo(tip, left, R, c),
      edgeTo(left, base, R, c),
      edgeTo(base, right, R, c),
      edgeTo(right, tip, R, c),
      'Z',
    ];
    paths.push(parts.join(' '));
  }

  return paths;
}

// ── Spike Star ────────────────────────────────────────────────────────────────
// 9 isosceles triangles radiating from center — classic 9-pointed star look.
function buildSpike(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const halfStep = Math.PI / N;
  const c = cfg.curveIntensity;

  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const tipAngle = baseRot + (TWO_PI * i) / N;
    const tip = pt(cx, cy, R, tipAngle);
    const left = pt(cx, cy, r, tipAngle - halfStep);
    const right = pt(cx, cy, r, tipAngle + halfStep);

    parts.push(
      moveTo(left),
      edgeTo(left, tip, R, c),
      edgeTo(tip, right, R, c),
      'Z',
    );
  }
  return [parts.join(' ')];
}

// ── Kite Star ─────────────────────────────────────────────────────────────────
function buildKite(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const inner = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const narrow = 0.25; // fraction of half-step for kite narrowness

  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const tipAngle = baseRot + (TWO_PI * i) / N;
    const halfStep = Math.PI / N;

    const tip = pt(cx, cy, R, tipAngle);
    const left = pt(cx, cy, inner, tipAngle - halfStep * narrow);
    const right = pt(cx, cy, inner, tipAngle + halfStep * narrow);
    const base = pt(cx, cy, inner * 0.2, tipAngle + Math.PI);

    parts.push(moveTo(tip), lineTo(right), lineTo(base), lineTo(left), 'Z');
  }
  return [parts.join(' ')];
}

// ── Stellated 9-gon ───────────────────────────────────────────────────────────
function buildStellated(cx: number, cy: number, cfg: StarConfig): string[] {
  const ngonR = cfg.outerRadius * cfg.innerRadiusRatio;
  const stellH = cfg.outerRadius * (1 - cfg.innerRadiusRatio);
  const baseRot = toRad(cfg.rotation);

  const base: Array<[number, number]> = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, ngonR, baseRot + (TWO_PI * i) / N),
  );

  const parts: string[] = [moveTo(base[0])];
  for (let i = 0; i < N; i++) {
    const a = base[i];
    const b = base[(i + 1) % N];
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const tip: [number, number] = [mx + (dx / len) * stellH, my + (dy / len) * stellH];
    parts.push(lineTo(a), lineTo(tip), lineTo(b));
  }
  parts.push('Z');
  return [parts.join(' ')];
}

// ── Petal Rose ────────────────────────────────────────────────────────────────
function buildPetal(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const pw = cfg.petalWidth * R * 0.6;
  const pc = cfg.petalCurve;

  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const angle = baseRot + (TWO_PI * i) / N;
    const tip = pt(cx, cy, R, angle);
    const perpAngle = angle + Math.PI / 2;

    const cp1: [number, number] = [
      cx + pw * Math.cos(perpAngle) + R * pc * 0.5 * Math.cos(angle),
      cy + pw * Math.sin(perpAngle) + R * pc * 0.5 * Math.sin(angle),
    ];
    const cp2: [number, number] = [tip[0] + pw * 0.5 * Math.cos(perpAngle), tip[1] + pw * 0.5 * Math.sin(perpAngle)];
    const cp3: [number, number] = [tip[0] - pw * 0.5 * Math.cos(perpAngle), tip[1] - pw * 0.5 * Math.sin(perpAngle)];
    const cp4: [number, number] = [
      cx - pw * Math.cos(perpAngle) + R * pc * 0.5 * Math.cos(angle),
      cy - pw * Math.sin(perpAngle) + R * pc * 0.5 * Math.sin(angle),
    ];

    parts.push(moveTo([cx, cy]), curveTo(cp1, cp2, tip), curveTo(cp3, cp4, [cx, cy]), 'Z');
  }
  return [parts.join(' ')];
}

// ── Curved Outline ────────────────────────────────────────────────────────────
// Classic spike star but all edges are forced Bézier curves.
function buildCurvedOutline(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const halfStep = Math.PI / N;
  const intensity = cfg.curveIntensity === 0 ? 0.4 : cfg.curveIntensity;

  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const outerAngle = baseRot + (TWO_PI * i) / N;
    const innerAngle = outerAngle + halfStep;
    pts.push(pt(cx, cy, R, outerAngle));
    pts.push(pt(cx, cy, r, innerAngle));
  }

  const parts = [moveTo(pts[0])];
  for (let i = 0; i < pts.length; i++) {
    const from = pts[i];
    const to = pts[(i + 1) % pts.length];
    const offset = R * intensity * 0.3;
    const cp = perpendicularCP(from, to, offset);
    parts.push(`Q ${fmt(cp[0])},${fmt(cp[1])} ${fmt(to[0])},${fmt(to[1])}`);
  }
  parts.push('Z');
  return [parts.join(' ')];
}

// ── Compound: 9-gon + inner star ─────────────────────────────────────────────
function buildCompound(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);

  const ngonPts: Array<[number, number]> = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, R, baseRot + (TWO_PI * i) / N),
  );
  const ngonPath = [moveTo(ngonPts[0]), ...ngonPts.slice(1).map(lineTo), 'Z'].join(' ');

  const innerPath = build9_2(cx, cy, { ...cfg, outerRadius: R * 0.62 })[0];
  return [ngonPath, innerPath];
}

// ── Concentric ────────────────────────────────────────────────────────────────
function buildConcentric(cx: number, cy: number, cfg: StarConfig): string[] {
  return [1, 0.65, 0.35].map((s) => build9_2(cx, cy, { ...cfg, outerRadius: cfg.outerRadius * s })[0]);
}

// ── Alternating Lengths ───────────────────────────────────────────────────────
function buildAltLength(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const pattern = cfg.altLengthPattern;
  const ratio = cfg.altLengthRatio;
  const halfStep = Math.PI / N;

  function outerR(i: number): number {
    if (pattern === 'short-long') return i % 2 === 0 ? R : R * ratio;
    const mod = i % 3;
    if (mod === 0) return R;
    if (mod === 1) return R * ((1 + ratio) / 2);
    return R * ratio;
  }

  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    pts.push(pt(cx, cy, outerR(i), baseRot + (TWO_PI * i) / N));
    pts.push(pt(cx, cy, r, baseRot + (TWO_PI * i) / N + halfStep));
  }

  return [[moveTo(pts[0]), ...pts.slice(1).map(lineTo), 'Z'].join(' ')];
}

// ── Spiral ────────────────────────────────────────────────────────────────────
function buildSpiral(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const twist = toRad(cfg.spiralTwist);
  const halfStep = Math.PI / N;

  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const extra = twist * i;
    const tipAngle = baseRot + (TWO_PI * i) / N + extra;
    parts.push(
      moveTo(pt(cx, cy, r, tipAngle - halfStep)),
      lineTo(pt(cx, cy, R, tipAngle)),
      lineTo(pt(cx, cy, r, tipAngle + halfStep)),
      'Z',
    );
  }
  return [parts.join(' ')];
}

// ── Mandala ───────────────────────────────────────────────────────────────────
function buildMandala(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const circR = R * 0.14;
  const paths: string[] = [];

  // Connecting ring (9-gon)
  const ring = Array.from({ length: N }, (_, i) => pt(cx, cy, R, baseRot + (TWO_PI * i) / N));
  paths.push([moveTo(ring[0]), ...ring.slice(1).map(lineTo), 'Z'].join(' '));

  // 9 circles
  for (let i = 0; i < N; i++) {
    const [px, py] = pt(cx, cy, R, baseRot + (TWO_PI * i) / N);
    paths.push(
      `M ${fmt(px - circR)},${fmt(py)} ` +
      `A ${fmt(circR)},${fmt(circR)} 0 1,0 ${fmt(px + circR)},${fmt(py)} ` +
      `A ${fmt(circR)},${fmt(circR)} 0 1,0 ${fmt(px - circR)},${fmt(py)} Z`,
    );
  }
  return paths;
}

// ── Interlace (simplified) ────────────────────────────────────────────────────
function buildInterlace(cx: number, cy: number, cfg: StarConfig): string[] {
  return build9_2(cx, cy, cfg);
}

// ── Fractal ───────────────────────────────────────────────────────────────────
function buildFractal(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const halfStep = Math.PI / N;
  const depth = Math.min(cfg.fractalDepth, 3);

  const parts: string[] = [];

  for (let i = 0; i < N; i++) {
    const tipAngle = baseRot + (TWO_PI * i) / N;
    const tip = pt(cx, cy, R, tipAngle);
    const left = pt(cx, cy, r, tipAngle - halfStep);
    const right = pt(cx, cy, r, tipAngle + halfStep);
    parts.push(`${moveTo(left)} ${lineTo(tip)} ${lineTo(right)} Z`);

    if (depth >= 2) {
      const miniR = R * 0.2;
      for (let j = 0; j < N; j++) {
        const mAngle = tipAngle + (TWO_PI * j) / N;
        const mTip = pt(tip[0], tip[1], miniR, mAngle);
        const mLeft = pt(tip[0], tip[1], miniR * cfg.innerRadiusRatio, mAngle - halfStep);
        const mRight = pt(tip[0], tip[1], miniR * cfg.innerRadiusRatio, mAngle + halfStep);
        parts.push(`${moveTo(mLeft)} ${lineTo(mTip)} ${lineTo(mRight)} Z`);
      }
    }
  }

  return [parts.join(' ')];
}

// ── Explosion ─────────────────────────────────────────────────────────────────
function buildExplosion(cx: number, cy: number, cfg: StarConfig): string[] {
  return buildSpike(cx, cy, { ...cfg, innerRadiusRatio: 0.15 });
}

// ── Inner polygon ─────────────────────────────────────────────────────────────
export function buildInnerPolygonPath(cx: number, cy: number, cfg: StarConfig): string {
  const r = cfg.outerRadius * cfg.innerRadiusRatio * 0.95;
  const baseRot = toRad(cfg.rotation);
  const pts = Array.from({ length: N }, (_, i) => pt(cx, cy, r, baseRot + (TWO_PI * i) / N));
  return [moveTo(pts[0]), ...pts.slice(1).map(lineTo), 'Z'].join(' ');
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export function buildStarPaths(cx: number, cy: number, cfg: StarConfig): string[] {
  switch (cfg.starType) {
    case '9-2':         return build9_2(cx, cy, cfg);
    case '9-4':         return build9_4(cx, cy, cfg);
    case '3-triangles': return build3Triangles(cx, cy, cfg);
    case '3-rhombuses': return build3Rhombuses(cx, cy, cfg);
    case 'spike':       return buildSpike(cx, cy, cfg);
    case 'kite':        return buildKite(cx, cy, cfg);
    case 'stellated':   return buildStellated(cx, cy, cfg);
    case 'explosion':   return buildExplosion(cx, cy, cfg);
    case 'petal':       return buildPetal(cx, cy, cfg);
    case 'curved-outline': return buildCurvedOutline(cx, cy, cfg);
    case 'compound':    return buildCompound(cx, cy, cfg);
    case 'concentric':  return buildConcentric(cx, cy, cfg);
    case 'alt-length':  return buildAltLength(cx, cy, cfg);
    case 'spiral':      return buildSpiral(cx, cy, cfg);
    case 'interlace':   return buildInterlace(cx, cy, cfg);
    case 'fractal':     return buildFractal(cx, cy, cfg);
    case 'mandala':     return buildMandala(cx, cy, cfg);
    default:            return build9_2(cx, cy, cfg);
  }
}
