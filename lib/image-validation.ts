const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
};

export function detectImageMime(bytes: Uint8Array): keyof typeof MIME_EXTENSIONS | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return 'image/png';
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp') {
    const brands = String.fromCharCode(...bytes.slice(8, Math.min(bytes.length, 32)));
    if (/(avif|avis)/.test(brands)) return 'image/avif';
  }
  return null;
}

export function safeImageFilename(filename: string, mime: keyof typeof MIME_EXTENSIONS) {
  const basename = filename.split(/[\\/]/).pop() ?? '';
  const stem = basename.replace(/\.[^.]*$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^_+|_+$/g, '').slice(0, 80);
  return `${stem || 'image'}.${MIME_EXTENSIONS[mime]}`;
}
