import {
  embedProjectInSvg,
  embedProjectInPngBytes,
  embedProjectInJpegBytes,
} from '@/lib/project-metadata';

export async function exportSVG(svgEl: SVGSVGElement, filename = 'star.svg', metadata?: string) {
  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(svgEl);
  if (metadata) svgStr = embedProjectInSvg(svgStr, metadata);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export async function exportRaster(
  svgEl: SVGSVGElement,
  format: 'png' | 'jpeg',
  width: number,
  height: number,
  filename?: string,
  metadata?: string,
) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        async (blob) => {
          if (!blob) { reject(new Error('Canvas export failed')); return; }
          try {
            let out = blob;
            if (metadata) {
              const bytes = new Uint8Array(await blob.arrayBuffer());
              const embedded = format === 'jpeg'
                ? embedProjectInJpegBytes(bytes, metadata)
                : embedProjectInPngBytes(bytes, metadata);
              out = new Blob([new Uint8Array(embedded)], { type: blob.type });
            }
            const name = filename ?? `star.${format === 'jpeg' ? 'jpg' : 'png'}`;
            triggerDownload(URL.createObjectURL(out), name);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        0.95,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
