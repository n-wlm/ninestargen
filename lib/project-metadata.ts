import type { GeometryComposition } from '@/types/geometry';
import { compositionToParams, paramsToComposition } from '@/lib/url-params';

// ---------------------------------------------------------------------------
// Project metadata — the "downloadable file IS a restore point" feature.
//
// On export we embed the design's build instructions into the file's metadata,
// using the SAME serialization the URL uses (`compositionToParams`). Re-uploading
// rebuilds the design from that embedded link, not from the pixels. The payload
// is a tiny JSON wrapper whose meaningful content is the shareable URL:
//
//   {"app":"ninestar.app","v":1,"url":"https://ninestar.app/?t=…&r=…&n=2"}
//
// One codec, both directions: `compositionToParams` writes it, `paramsToComposition`
// reads it — so the URL and the embedded metadata are byte-identical by construction.
// The payload is pure ASCII (URLSearchParams percent-encodes; layer names never enter
// the URL), so it embeds safely as Latin-1 text in every container.
// ---------------------------------------------------------------------------

const APP_TAG = 'ninestar.app';
const PAYLOAD_VERSION = 1;

// PNG tEXt keyword / SVG namespace marker. ASCII, ≤79 bytes (PNG keyword limit).
const PNG_KEYWORD = 'ninestar.app';
const SVG_NS = 'https://ninestar.app/ns';

export type ImportResult =
  | { ok: true; composition: GeometryComposition }
  | { ok: false; reason: 'no-data' | 'unreadable' | 'unsupported' };

// --- Payload codec ---------------------------------------------------------

export function buildProjectPayload(comp: GeometryComposition): string {
  const params = compositionToParams(comp).toString();
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://ninestar.app';
  const url = `${origin}/${params ? `?${params}` : ''}`;
  return JSON.stringify({ app: APP_TAG, v: PAYLOAD_VERSION, url });
}

// Parse an embedded payload back into a composition. Tolerant: returns null for
// anything that isn't a valid ninestargen payload so callers can show "no data".
export function parseProjectPayload(raw: string): GeometryComposition | null {
  try {
    const obj = JSON.parse(raw) as { app?: unknown; url?: unknown };
    if (obj?.app !== APP_TAG || typeof obj.url !== 'string') return null;
    // Take the query string whether `url` is absolute or a bare `?…`.
    const q = obj.url.includes('?') ? obj.url.slice(obj.url.indexOf('?') + 1) : '';
    return paramsToComposition(new URLSearchParams(q));
  } catch {
    return null;
  }
}

// Find our JSON object anywhere inside a text blob. The payload has no nested
// braces (the URL is percent-encoded), so a lazy match to the first `}` is safe.
const PAYLOAD_RE = /\{"app":"ninestar\.app"[^}]*\}/;

// --- SVG -------------------------------------------------------------------

export function embedProjectInSvg(svgMarkup: string, payload: string): string {
  const block = `<metadata><ninestar:project xmlns:ninestar="${SVG_NS}">${escapeXml(
    payload,
  )}</ninestar:project></metadata>`;
  // Inject right after the opening <svg …> tag; render-invisible.
  const m = /<svg\b[^>]*>/.exec(svgMarkup);
  if (!m) return svgMarkup;
  const at = m.index + m[0].length;
  return svgMarkup.slice(0, at) + block + svgMarkup.slice(at);
}

function extractProjectFromSvg(text: string): GeometryComposition | null {
  const m = PAYLOAD_RE.exec(unescapeXml(text));
  return m ? parseProjectPayload(m[0]) : null;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function unescapeXml(s: string): string {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

// --- Byte helpers ----------------------------------------------------------

function asciiBytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
  return out;
}
function bytesToAscii(bytes: Uint8Array, start: number, end: number): string {
  let s = '';
  for (let i = start; i < end; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

// --- PNG (tEXt chunk) ------------------------------------------------------

const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: number[]): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function hasPngSig(b: Uint8Array): boolean {
  if (b.length < 8) return false;
  for (let i = 0; i < 8; i++) if (b[i] !== PNG_SIG[i]) return false;
  return true;
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

export function embedProjectInPngBytes(bytes: Uint8Array, payload: string): Uint8Array {
  if (!hasPngSig(bytes)) return bytes;

  // tEXt data = keyword + 0x00 + text (Latin-1). type+data feed the CRC.
  const data = [...asciiBytes(PNG_KEYWORD), 0, ...asciiBytes(payload)];
  const type = asciiBytes('tEXt');
  const chunk = [...u32(data.length), ...type, ...data, ...u32(crc32([...type, ...data]))];

  // Walk chunks to find IEND, splice our chunk in just before it.
  let pos = 8;
  while (pos + 8 <= bytes.length) {
    const len = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
    const typeStr = bytesToAscii(bytes, pos + 4, pos + 8);
    if (typeStr === 'IEND') break;
    pos += 12 + len; // length(4) + type(4) + data(len) + crc(4)
  }

  const out = new Uint8Array(bytes.length + chunk.length);
  out.set(bytes.subarray(0, pos), 0);
  out.set(Uint8Array.from(chunk), pos);
  out.set(bytes.subarray(pos), pos + chunk.length);
  return out;
}

function extractProjectFromPng(bytes: Uint8Array): GeometryComposition | null {
  if (!hasPngSig(bytes)) return null;
  let pos = 8;
  while (pos + 8 <= bytes.length) {
    const len = (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
    const typeStr = bytesToAscii(bytes, pos + 4, pos + 8);
    const dataStart = pos + 8;
    const dataEnd = dataStart + len;
    if (dataEnd > bytes.length) break;
    if (typeStr === 'tEXt') {
      const text = bytesToAscii(bytes, dataStart, dataEnd); // keyword\0value
      const m = PAYLOAD_RE.exec(text);
      if (m) return parseProjectPayload(m[0]);
    }
    if (typeStr === 'IEND') break;
    pos = dataEnd + 4; // skip CRC
  }
  return null;
}

// --- JPEG (COM marker) -----------------------------------------------------

export function embedProjectInJpegBytes(bytes: Uint8Array, payload: string): Uint8Array {
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes; // no SOI
  const body = asciiBytes(payload);
  const segLen = body.length + 2; // length field counts itself
  if (segLen > 0xffff) return bytes; // payload too big for one COM segment
  const seg = [0xff, 0xfe, (segLen >> 8) & 0xff, segLen & 0xff, ...body];

  const out = new Uint8Array(bytes.length + seg.length);
  out.set(bytes.subarray(0, 2), 0); // SOI
  out.set(Uint8Array.from(seg), 2); // COM right after SOI
  out.set(bytes.subarray(2), 2 + seg.length);
  return out;
}

function extractProjectFromJpeg(bytes: Uint8Array): GeometryComposition | null {
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) { pos++; continue; }
    const marker = bytes[pos + 1];
    if (marker === 0xda || marker === 0xd9) break; // SOS / EOI — scan data begins
    // Standalone markers (RSTn, TEM) carry no length.
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { pos += 2; continue; }
    const segLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
    const dataStart = pos + 4;
    const dataEnd = pos + 2 + segLen;
    if (dataEnd > bytes.length) break;
    if (marker === 0xfe) {
      const text = bytesToAscii(bytes, dataStart, dataEnd);
      const m = PAYLOAD_RE.exec(text);
      if (m) return parseProjectPayload(m[0]);
    }
    pos = dataEnd;
  }
  return null;
}

// --- File dispatch ---------------------------------------------------------

function kindOf(file: File): 'svg' | 'png' | 'jpeg' | null {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t === 'image/svg+xml' || n.endsWith('.svg')) return 'svg';
  if (t === 'image/png' || n.endsWith('.png')) return 'png';
  if (t === 'image/jpeg' || n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'jpeg';
  return null;
}

// Reads an exported file and rebuilds the composition from embedded metadata.
// Distinguishes "wrong file type", "unreadable container", and the common
// "valid image but not one of ours" so the UI can explain what happened.
export async function extractProjectFromFile(file: File): Promise<ImportResult> {
  const kind = kindOf(file);
  if (!kind) return { ok: false, reason: 'unsupported' };

  try {
    let comp: GeometryComposition | null;
    if (kind === 'svg') {
      comp = extractProjectFromSvg(await file.text());
    } else {
      const bytes = new Uint8Array(await file.arrayBuffer());
      comp = kind === 'png' ? extractProjectFromPng(bytes) : extractProjectFromJpeg(bytes);
    }
    if (!comp) return { ok: false, reason: 'no-data' };
    return { ok: true, composition: comp };
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}
