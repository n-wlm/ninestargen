import { makeLayer, type ImageLayer } from '@/types/composition';

const ACCEPTED = ['image/svg+xml', 'image/png', 'image/jpeg'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPT_ATTR = '.svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg';

export class UploadError extends Error {}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new UploadError('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function readDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // SVGs without an intrinsic size report 0 — fall back to a square.
      const width = img.naturalWidth || img.width || 300;
      const height = img.naturalHeight || img.height || 300;
      resolve({ width, height });
    };
    img.onerror = () => reject(new UploadError('Could not load image'));
    img.src = dataUrl;
  });
}

// Converts an uploaded file into an ImageLayer. Data URLs (not blob URLs) are
// used so the SVG stays self-contained and raster export never taints the canvas.
export async function fileToLayer(file: File): Promise<ImageLayer> {
  if (!ACCEPTED.includes(file.type)) {
    throw new UploadError('Only SVG, PNG or JPG allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('File too large (max 5 MB)');
  }

  const dataUrl = await readAsDataURL(file);
  const { width, height } = await readDimensions(dataUrl);
  const name = file.name.replace(/\.[^.]+$/, '') || 'Image';
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `layer-${Date.now()}`;

  return makeLayer(id, name, dataUrl, width, height);
}
