import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
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

    // Limit ukuran file untuk mematuhi Vercel Free Tier Serverless (Maksimal 4.5 MB)
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran berkas melebihi batas maksimal 4.5 MB. Harap pilih berkas lain atau gunakan kamera.' },
        { status: 413 }
      );
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
      message: 'Unggah berkas berhasil',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses unggahan berkas. Silakan coba beberapa saat lagi.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    let urlOrPublicId = '';
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      urlOrPublicId = body.url || body.publicId || '';
    } else {
      const { searchParams } = new URL(req.url);
      urlOrPublicId = searchParams.get('url') || searchParams.get('publicId') || '';
    }

    if (!urlOrPublicId) {
      return NextResponse.json({ error: 'URL atau publicId berkas wajib disertakan' }, { status: 400 });
    }

    const isAudio = urlOrPublicId.endsWith('.mp3') || urlOrPublicId.endsWith('.wav') || urlOrPublicId.includes('/video/');
    const resourceType = isAudio ? 'video' : 'image';

    const success = await deleteFromCloudinary(urlOrPublicId, resourceType);
    return NextResponse.json({ success, message: success ? 'Berkas berhasil dihapus dari Cloudinary' : 'Gagal menghapus berkas dari Cloudinary' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: 'Gagal memproses penghapusan berkas' }, { status: 500 });
  }
}
