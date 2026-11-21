import {NextResponse} from 'next/server';
import {put} from '@vercel/blob';
import {checkIpRateLimit, getClientIp} from '@/lib/rate-limit';
import {detectImageMime, safeImageFilename} from '@/lib/image-validation';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    if (await checkIpRateLimit('feedback-upload', ip, 10, 60 * 60 * 1000) !== null) {
      return NextResponse.json({error: 'Too many uploads. Please try again later.'}, {status: 429});
    }
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > MAX_FILE_SIZE + 256 * 1024) {
      return NextResponse.json({error: 'Upload request is too large'}, {status: 413});
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({error: 'Invalid multipart form data'}, {status: 400});
    }
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({error: 'An image file is required'}, {status: 400});
    if (!allowedTypes.has(file.type)) return NextResponse.json({error: 'Only JPEG, PNG, and WebP images are allowed'}, {status: 400});
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({error: 'Image must be 5 MB or smaller'}, {status: 400});
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectImageMime(bytes);
    if (!mime || mime !== file.type) return NextResponse.json({error: 'Image content does not match its file type'}, {status: 400});

    const filename = safeImageFilename(file.name, mime);
    const blob = await put(`feedback/${filename}`, new Blob([bytes], {type: mime}), {
      access: 'public',
      addRandomSuffix: true,
      contentType: mime
    });
    return NextResponse.json({url: blob.url});
  } catch (error) {
    console.error('Feedback image upload failed', error);
    return NextResponse.json({error: 'Image upload failed'}, {status: 500});
  }
}
