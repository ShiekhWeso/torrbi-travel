import {put} from '@vercel/blob';
import {getSession} from '@/lib/auth';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request) {
  try {
    if (!(await getSession())) {
      return Response.json({error: 'Unauthorized'}, {status: 401});
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
    if (!allowedTypes.has(file.type)) {
      return Response.json({error: 'Only JPEG, PNG, and WebP images are allowed'}, {status: 400});
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({error: 'Image must be 4 MB or smaller'}, {status: 400});
    }

    const filename = file.name
      .replace(/^.*[\\/]/, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_') || 'image.webp';
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return Response.json({url: blob.url});
  } catch (error) {
    console.error('Image upload failed', error);
    return Response.json({error: 'Image upload failed'}, {status: 500});
  }
}
