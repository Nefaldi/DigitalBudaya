import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isWithinSulteng } from '@/lib/sultengLocations';
import { Prisma, StatusPenyelamatan, KategoriPusaka } from '@prisma/client';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { checkRateLimit } from '@/lib/rateLimit';
import { invalidateCache } from '@/lib/serverCache';

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

    const rateLimit = checkRateLimit(`report-patch:${user.id}`, { maxRequests: 30, intervalMs: 60_000 });
    if (!rateLimit.isAllowed) {
      const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pembaruan laporan. Coba lagi dalam ${retrySeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
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

      // If pelapor replaces initial photo with a new one, remove previous one from Cloudinary
      if (fotoKondisiAwal && report.fotoKondisiAwal && fotoKondisiAwal !== report.fotoKondisiAwal) {
        deleteFromCloudinary(report.fotoKondisiAwal, 'image').catch(() => {});
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

      invalidateCache('reports:');
      invalidateCache('analytics:');
      return NextResponse.json({ message: 'Laporan berhasil diperbarui oleh Pelapor', report: updated });
    }

    // ADMIN or SUPERADMIN Workflow
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      const { status, fotoDigitalisasi, rekamanAudioUrl, catatanPenanganan, adminId } = body;

      const dataToUpdate: Prisma.HeritageReportUncheckedUpdateInput = {};

      // Penugasan Konservator / Petugas (seperti alur Sibersih)
      if (adminId !== undefined) {
        dataToUpdate.adminId = adminId || null;
        if (adminId && !status && report.status === 'LAPORAN_MASUK') {
          dataToUpdate.status = StatusPenyelamatan.DIPROSES;
        }
      }

      if (status) {
        // Workflow Validation ala Sibersih: LAPORAN_MASUK -> DIPROSES -> MENUNGGU_VALIDASI -> SELESAI
        if (status === 'DIPROSES') {
          dataToUpdate.status = StatusPenyelamatan.DIPROSES;
          if (dataToUpdate.adminId === undefined && !report.adminId) {
            dataToUpdate.adminId = user.id; // Take ownership if unassigned
          }
        } else if (status === 'MENUNGGU_VALIDASI') {
          dataToUpdate.status = StatusPenyelamatan.MENUNGGU_VALIDASI;
          if (dataToUpdate.adminId === undefined && !report.adminId) {
            dataToUpdate.adminId = user.id;
          }
        } else if (status === 'SELESAI') {
          // Hanya Superadmin yang berwenang memvalidasi dan menyelesaikan laporan (ala Sibersih)
          if (user.role !== 'SUPERADMIN') {
            return NextResponse.json(
              { error: 'Hanya Superadmin yang berwenang memvalidasi dan mengesahkan laporan selesai.' },
              { status: 403 }
            );
          }
          // Validasi alur Sibersih: Hanya laporan yang sudah selesai dikerjakan & diajukan petugas (MENUNGGU_VALIDASI) yang dapat disahkan selesai
          if (report.status !== StatusPenyelamatan.MENUNGGU_VALIDASI) {
            return NextResponse.json(
              { error: 'Laporan belum diajukan penyelesaiannya oleh petugas konservator.' },
              { status: 400 }
            );
          }
          dataToUpdate.status = StatusPenyelamatan.SELESAI;
          if (dataToUpdate.adminId === undefined && !report.adminId) {
            dataToUpdate.adminId = user.id;
          }
        } else if (status === 'LAPORAN_MASUK') {
          dataToUpdate.status = StatusPenyelamatan.LAPORAN_MASUK;
        }
      }

      // Jika Petugas (Admin) mengunggah bukti pengerjaan/catatan tanpa ubah status eksplisit, otomatis ajukan ke MENUNGGU_VALIDASI
      if (user.role === 'ADMIN' && fotoDigitalisasi && !status && report.status !== 'SELESAI') {
        dataToUpdate.status = StatusPenyelamatan.MENUNGGU_VALIDASI;
        if (!report.adminId) dataToUpdate.adminId = user.id;
      }

      if (fotoDigitalisasi !== undefined) dataToUpdate.fotoDigitalisasi = fotoDigitalisasi;
      if (rekamanAudioUrl !== undefined) dataToUpdate.rekamanAudioUrl = rekamanAudioUrl;
      if (catatanPenanganan !== undefined) dataToUpdate.catatanPenanganan = catatanPenanganan;

      // If admin replaces restoration photo or audio with new files, remove superseded ones from Cloudinary
      if (fotoDigitalisasi && report.fotoDigitalisasi && fotoDigitalisasi !== report.fotoDigitalisasi) {
        deleteFromCloudinary(report.fotoDigitalisasi, 'image').catch(() => {});
      }
      if (rekamanAudioUrl && report.rekamanAudioUrl && rekamanAudioUrl !== report.rekamanAudioUrl) {
        deleteFromCloudinary(report.rekamanAudioUrl, 'video').catch(() => {});
      }

      const updated = await prisma.heritageReport.update({
        where: { id },
        data: dataToUpdate,
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
      });

      invalidateCache('reports:');
      invalidateCache('analytics:');

      const actionMessage =
        adminId !== undefined && !status
          ? (adminId ? 'Tugas laporan berhasil ditugaskan ke Konservator' : 'Penugasan konservator berhasil direset')
          : dataToUpdate.status === StatusPenyelamatan.MENUNGGU_VALIDASI
          ? 'Hasil pekerjaan berhasil diajukan! Menunggu persetujuan validasi Superadmin'
          : dataToUpdate.status === StatusPenyelamatan.SELESAI
          ? 'Laporan berhasil disetujui & disahkan selesai (resmi terbit di katalog publik)'
          : dataToUpdate.status === StatusPenyelamatan.DIPROSES
          ? 'Laporan dipindahkan ke penanganan aktif petugas'
          : 'Data laporan berhasil diperbarui';

      return NextResponse.json({ message: actionMessage, report: updated });
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

    const rateLimit = checkRateLimit(`report-delete:${user.id}`, { maxRequests: 10, intervalMs: 60_000 });
    if (!rateLimit.isAllowed) {
      const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak permintaan penghapusan laporan. Coba lagi dalam ${retrySeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
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
    } else if (user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Superadmin yang dapat menghapus laporan' }, { status: 403 });
    }

    // Garbage collection of media assets on Cloudinary
    const deletePromises: Promise<boolean>[] = [];
    if (report.fotoKondisiAwal) {
      deletePromises.push(deleteFromCloudinary(report.fotoKondisiAwal, 'image'));
    }
    if (report.fotoDigitalisasi) {
      deletePromises.push(deleteFromCloudinary(report.fotoDigitalisasi, 'image'));
    }
    if (report.rekamanAudioUrl) {
      deletePromises.push(deleteFromCloudinary(report.rekamanAudioUrl, 'video'));
    }
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    await prisma.heritageReport.delete({ where: { id } });

    invalidateCache('reports:');
    invalidateCache('analytics:');

    return NextResponse.json({ message: 'Laporan berhasil dibatalkan/dihapus' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Gagal menghapus laporan' }, { status: 500 });
  }
}
