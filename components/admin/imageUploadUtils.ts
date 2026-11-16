const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function toWebp(file: File): Promise<Blob> {
  if (!allowedTypes.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }

  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2000 / image.width, 2000 / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process this image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', 0.85);
    });
    if (!blob || blob.type !== 'image/webp') {
      throw new Error('This browser could not convert the image to WebP.');
    }
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('Image is still larger than 4 MB after conversion.');
    }
    return blob;
  } finally {
    image.close();
  }
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await toWebp(file);
  const filename = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`;
  const formData = new FormData();
  formData.append('file', new File([blob], filename, {type: 'image/webp'}));

  const response = await fetch('/api/upload', {method: 'POST', body: formData});
  let result: {url?: unknown; error?: unknown};
  try {
    result = await response.json();
  } catch {
    throw new Error('The upload server returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Image upload failed.');
  }
  if (typeof result.url !== 'string') {
    throw new Error('The upload server did not return an image URL.');
  }
  return result.url;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Image upload failed.';
}
