import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { validateAdminApiRequest, setAdminCookie } from '@/lib/auth';

// Configure Cloudinary from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a buffer directly to Cloudinary using upload_stream
 */
function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'animoview/reviews',
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload returned no result'));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  const auth = await validateAdminApiRequest(request);
  if (!auth.authorized) {
    return auth.errorResponse;
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // 1. File size limit: 10MB max
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 10MB' },
        { status: 400 }
      );
    }

    // 2. Strict file extension & MIME type whitelist (Images only)
    const ext = path.extname(file.name).toLowerCase();
    const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
    const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

    if (!ALLOWED_EXTENSIONS.has(ext) || (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase()))) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF images are allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean sanitized filename / public_id
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const cleanId = `${Date.now()}-${randomSuffix}`;
    const cleanFilename = `${cleanId}${ext}`;

    let publicUrl = '';

    // If Cloudinary credentials are configured, upload to Cloudinary CDN
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadResult = await uploadToCloudinary(buffer, cleanId);
      publicUrl = uploadResult.secure_url;
    } else {
      // Fallback to local public/uploads (e.g. offline local dev)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, cleanFilename);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${cleanFilename}`;
    }

    const response = NextResponse.json({ url: publicUrl });
    // Slide 40-minute window forward
    setAdminCookie(response, auth.refreshedToken);
    return response;
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
