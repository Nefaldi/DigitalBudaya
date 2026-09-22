import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isWithinSulteng } from '@/lib/sultengLocations';
import { StatusPenyelamatan, KategoriPusaka } from '@prisma/client';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const report = await prisma.heritageReport.findUnique({
      where: { id },
      include: {
        pelapor: { select: { id: true, nama: true, email: true } },
        admin: { select: { id: true, nama: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching single report:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail laporan' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    const report = await prisma.heritageReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();

    // Check Authorization & Role Workflows (State Machine)
    if (user.role === 'PELAPOR') {
      // Pelapor can only edit their own report while status is LAPORAN_MASUK
      if (report.pelaporId !== user.id) {
        return NextResponse.json({ error: 'Anda tidak memiliki hak akses untuk mengubah laporan ini' }, { status: 403 });
      }

      if (report.status !== StatusPenyelamatan.LAPORAN_MASUK) {
        return NextResponse.json(
          { error: 'Laporan yang sedang DIPROSES atau SELESAI dikunci dan tidak dapat diubah oleh Pelapor' },
          { status: 400 }
        );
      }

      const { judulPusaka, kategori, lokasiSpesifik, kabupatenKota, latitude, longitude, deskripsiKrisis, fotoKondisiAwal } = body;

      const latNum = latitude != null ? parseFloat(latitude) : report.latitude;
      const lngNum = longitude != null ? parseFloat(longitude) : report.longitude;

      if (!isWithinSulteng(latNum, lngNum)) {
        return NextResponse.json({ error: 'Koordinat GPS berada di luar wilayah Sulawesi Tengah' }, { status: 400 });
      }

      const updated = await prisma.heritageReport.update({
        where: { id },
        data: {
          judulPusaka: judulPusaka || report.judulPusaka,
          kategori: kategori === 'TAKBENDA' ? KategoriPusaka.TAKBENDA : kategori === 'BENDA' ? KategoriPusaka.BENDA : report.kategori,
          lokasiSpesifik: lokasiSpesifik || report.lokasiSpesifik,
          kabupatenKota: kabupatenKota || report.kabupatenKota,
          latitude: latNum,
          longitude: lngNum,
          deskripsiKrisis: deskripsiKrisis || report.deskripsiKrisis,
          fotoKondisiAwal: fotoKondisiAwal || report.fotoKondisiAwal,
        },
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
      });

      return NextResponse.json({ message: 'Laporan berhasil diperbarui oleh Pelapor', report: updated });
    }

    // ADMIN or SUPERADMIN Workflow
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      const { status, fotoDigitalisasi, rekamanAudioUrl, catatanPenanganan } = body;

      const dataToUpdate: any = {};

      if (status) {
        // Workflow Validation: LAPORAN_MASUK -> DIPROSES -> SELESAI
        if (status === 'DIPROSES') {
          dataToUpdate.status = StatusPenyelamatan.DIPROSES;
          dataToUpdate.adminId = user.id; // Take ownership
        } else if (status === 'SELESAI') {
          dataToUpdate.status = StatusPenyelamatan.SELESAI;
          if (!report.adminId) {
            dataToUpdate.adminId = user.id;
          }
        } else if (status === 'LAPORAN_MASUK') {
          dataToUpdate.status = StatusPenyelamatan.LAPORAN_MASUK;
        }
      }

      if (fotoDigitalisasi !== undefined) dataToUpdate.fotoDigitalisasi = fotoDigitalisasi;
      if (rekamanAudioUrl !== undefined) dataToUpdate.rekamanAudioUrl = rekamanAudioUrl;
      if (catatanPenanganan !== undefined) dataToUpdate.catatanPenanganan = catatanPenanganan;

      const updated = await prisma.heritageReport.update({
        where: { id },
        data: dataToUpdate,
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
      });

      return NextResponse.json({ message: 'Status dan data penanganan berhasil diperbarui oleh Admin', report: updated });
    }

    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Gagal memperbarui laporan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    const report = await prisma.heritageReport.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    // Permission check
    if (user.role === 'PELAPOR') {
      if (report.pelaporId !== user.id) {
        return NextResponse.json({ error: 'Anda tidak berhak menghapus laporan orang lain' }, { status: 403 });
      }
      if (report.status !== StatusPenyelamatan.LAPORAN_MASUK) {
        return NextResponse.json({ error: 'Laporan yang sedang diproses atau selesai tidak dapat dibatalkan/dihapus' }, { status: 400 });
      }
    } else if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    await prisma.heritageReport.delete({ where: { id } });

    return NextResponse.json({ message: 'Laporan berhasil dibatalkan/dihapus' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Gagal menghapus laporan' }, { status: 500 });
  }
}
