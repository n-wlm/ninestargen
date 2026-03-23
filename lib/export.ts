export async function exportSVG(svgEl: SVGSVGElement, filename = 'star.svg') {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export async function exportRaster(
  svgEl: SVGSVGElement,
  format: 'png' | 'jpeg',
  width: number,
  height: number,
  filename?: string,
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
        (blob) => {
          if (!blob) { reject(new Error('Canvas export failed')); return; }
          const name = filename ?? `star.${format === 'jpeg' ? 'jpg' : 'png'}`;
          triggerDownload(URL.createObjectURL(blob), name);
          resolve();
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
