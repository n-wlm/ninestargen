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

function edgeTo(from: [number, number], to: [number, number], R: number, intensity: number): string {
  if (intensity === 0) return lineTo(to);
  const offset = R * intensity * 0.3;
  const cp = perpendicularCP(from, to, offset);
  return `Q ${fmt(cp[0])},${fmt(cp[1])} ${fmt(to[0])},${fmt(to[1])}`;
}

/**
 * Build a closed polygon path with optional corner rounding and edge curvature.
 * Handles all four combinations:
 *   rounding=0, curve=0 → straight polygon
 *   rounding=0, curve≠0 → curved edges (quadratic bezier per edge)
 *   rounding>0, curve=0 → rounded vertices with straight edges
 *   rounding>0, curve≠0 → rounded vertices + curved edges (combined)
 */
function buildPolygonPath(pts: [number, number][], rounding: number, R: number, curve: number): string {
  const n = pts.length;

  if (rounding <= 0) {
    // No rounding — just curved or straight edges
    const parts = [moveTo(pts[0])];
    for (let i = 1; i < n; i++) parts.push(edgeTo(pts[i - 1], pts[i], R, curve));
    parts.push(edgeTo(pts[n - 1], pts[0], R, curve), 'Z');
    return parts.join(' ');
  }

  // Compute A (approach) and B (depart) offset points for each vertex
  const maxOffset = R * rounding * 0.28;
  const apts: [number, number][] = [];
  const bpts: [number, number][] = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];

    const inX = prev[0] - curr[0], inY = prev[1] - curr[1];
    const inLen = Math.sqrt(inX * inX + inY * inY) || 1;
    const outX = next[0] - curr[0], outY = next[1] - curr[1];
    const outLen = Math.sqrt(outX * outX + outY * outY) || 1;

    const off = Math.min(maxOffset, inLen * 0.45, outLen * 0.45);
    apts[i] = [curr[0] + (inX / inLen) * off, curr[1] + (inY / inLen) * off];
    bpts[i] = [curr[0] + (outX / outLen) * off, curr[1] + (outY / outLen) * off];
  }

  // Path: for each vertex, Q-arc through vertex, then edge (curved or straight) to next approach point
  const parts: string[] = [moveTo(apts[0])];
  for (let i = 0; i < n; i++) {
    const v = pts[i];
    parts.push(`Q ${fmt(v[0])},${fmt(v[1])} ${fmt(bpts[i][0])},${fmt(bpts[i][1])}`);
    parts.push(edgeTo(bpts[i], apts[(i + 1) % n], R, curve));
  }
  parts.push('Z');
  return parts.join(' ');
}

// ── {9/2} ─────────────────────────────────────────────────────────────────────
function build9_2(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const pts: [number, number][] = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, R, baseRot + (TWO_PI * i) / N),
  );
  const order: number[] = [];
  let cur = 0;
  for (let i = 0; i < N; i++) { order.push(cur); cur = (cur + 2) % N; }
  return [buildPolygonPath(order.map(i => pts[i]), cfg.cornerRounding, R, cfg.curveIntensity)];
}

// ── {9/4} ─────────────────────────────────────────────────────────────────────
function build9_4(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  const pts: [number, number][] = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, R, baseRot + (TWO_PI * i) / N),
  );
  const order: number[] = [];
  let cur = 0;
  for (let i = 0; i < N; i++) { order.push(cur); cur = (cur + 4) % N; }
  return [buildPolygonPath(order.map(i => pts[i]), cfg.cornerRounding, R, cfg.curveIntensity)];
}

// ── Triple Triangle ───────────────────────────────────────────────────────────
function build3Triangles(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const baseRot = toRad(cfg.rotation);
  return Array.from({ length: 3 }, (_, t) => {
    const offset = baseRot + (TWO_PI * t) / N;
    return buildPolygonPath([
      pt(cx, cy, R, offset),
      pt(cx, cy, R, offset + TWO_PI / 3),
      pt(cx, cy, R, offset + (2 * TWO_PI) / 3),
    ], cfg.cornerRounding, R, cfg.curveIntensity);
  });
}

// ── Spike Star ────────────────────────────────────────────────────────────────
function buildSpike(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const r = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const halfStep = Math.PI / N;
  const verts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const tipAngle = baseRot + (TWO_PI * i) / N;
    verts.push(pt(cx, cy, r, tipAngle - halfStep));
    verts.push(pt(cx, cy, R, tipAngle));
  }
  return [buildPolygonPath(verts, cfg.cornerRounding, R, cfg.curveIntensity)];
}

// ── Kite Star ─────────────────────────────────────────────────────────────────
// Each petal spans from one inter-petal midpoint to the next, meeting at the tip.
// Adjacent petals share their side points — fully connected, no gaps or inner star.
function buildKite(cx: number, cy: number, cfg: StarConfig): string[] {
  const R = cfg.outerRadius;
  const inner = R * cfg.innerRadiusRatio;
  const baseRot = toRad(cfg.rotation);
  const halfStep = Math.PI / N;
  const parts: string[] = [];
  for (let i = 0; i < N; i++) {
    const tipAngle = baseRot + (TWO_PI * i) / N;
    parts.push(buildPolygonPath([
      pt(cx, cy, inner, tipAngle - halfStep),
      pt(cx, cy, R,     tipAngle),
      pt(cx, cy, inner, tipAngle + halfStep),
    ], cfg.cornerRounding, R, cfg.curveIntensity));
  }
  return [parts.join(' ')];
}

// ── Stellated 9-gon ───────────────────────────────────────────────────────────
function buildStellated(cx: number, cy: number, cfg: StarConfig): string[] {
  const ngonR = cfg.outerRadius * cfg.innerRadiusRatio;
  const stellH = cfg.outerRadius * (1 - cfg.innerRadiusRatio);
  const baseRot = toRad(cfg.rotation);

  const base: [number, number][] = Array.from({ length: N }, (_, i) =>
    pt(cx, cy, ngonR, baseRot + (TWO_PI * i) / N),
  );

  const verts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = base[i];
    const b = base[(i + 1) % N];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = mx - cx, dy = my - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    verts.push(a, [mx + (dx / len) * stellH, my + (dy / len) * stellH]);
  }
  return [buildPolygonPath(verts, cfg.cornerRounding, cfg.outerRadius, 0)];
}

// ── Explosion ─────────────────────────────────────────────────────────────────
function buildExplosion(cx: number, cy: number, cfg: StarConfig): string[] {
  return buildSpike(cx, cy, { ...cfg, innerRadiusRatio: Math.min(cfg.innerRadiusRatio, 0.2) });
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
    case '9-2':            return build9_2(cx, cy, cfg);
    case '9-4':            return build9_4(cx, cy, cfg);
    case '3-triangles':    return build3Triangles(cx, cy, cfg);
    case 'spike':          return buildSpike(cx, cy, cfg);
    case 'kite':           return buildKite(cx, cy, cfg);
    case 'petal':          return buildPetal(cx, cy, cfg);
    default:               return build9_2(cx, cy, cfg);
  }
}
