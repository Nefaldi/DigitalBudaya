import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu untuk mengunggah berkas' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'digiculture_care';

    if (!file) {
      return NextResponse.json({ error: 'Berkas file tidak ditemukan dalam form-data' }, { status: 400 });
    }

    // Convert File object to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource_type for Cloudinary (image vs audio/video)
    const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav');
    const resourceType = isAudio ? 'video' : 'image';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, resourceType);

    return NextResponse.json({
      message: 'Upload ke Cloudinary berhasil',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah berkas ke Cloudinary. Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET telah diset di .env' },
      { status: 500 }
    );
  }
}
