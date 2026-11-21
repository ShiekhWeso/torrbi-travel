import {put} from '@vercel/blob';
import {getSession} from '@/lib/auth';
import {detectImageMime, safeImageFilename} from '@/lib/image-validation';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function POST(request: Request) {
  try {
    if (!(await getSession())) {
      return Response.json({error: 'Unauthorized'}, {status: 401});
    }
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > MAX_FILE_SIZE + 256 * 1024) {
      return Response.json({error: 'Upload request is too large'}, {status: 413});
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json({error: 'Invalid multipart form data'}, {status: 400});
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return Response.json({error: 'An image file is required'}, {status: 400});
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({error: 'Image must be 10 MB or smaller'}, {status: 400});
    }
    if (!allowedTypes.has(file.type)) return Response.json({error: 'Only JPEG, PNG, WebP, and AVIF images are allowed'}, {status: 400});

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectImageMime(bytes);
    if (!mime || mime !== file.type) return Response.json({error: 'Image content does not match its file type'}, {status: 400});

    const filename = safeImageFilename(file.name, mime);
    const blob = await put(`uploads/${filename}`, new Blob([bytes], {type: mime}), {
      access: 'public',
      addRandomSuffix: true,
      contentType: mime
    });

    return Response.json({url: blob.url});
  } catch (error) {
    console.error('Image upload failed', error);
    return Response.json({error: 'Image upload failed'}, {status: 500});
  }
}
