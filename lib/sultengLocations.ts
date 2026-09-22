export const SULTENG_KABUPATEN_KOTA = [
  'Kota Palu',
  'Kabupaten Poso',
  'Kabupaten Sigi',
  'Kabupaten Donggala',
  'Kabupaten Parigi Moutong',
  'Kabupaten Tojo Una-Una',
  'Kabupaten Banggai',
  'Kabupaten Banggai Laut',
  'Kabupaten Banggai Kepulauan',
  'Kabupaten Buol',
  'Kabupaten Tolitoli',
  'Kabupaten Morowali',
  'Kabupaten Morowali Utara',
] as const;

export type KabupatenKotaSulteng = (typeof SULTENG_KABUPATEN_KOTA)[number];

// Bounding box for Sulawesi Tengah geographical coordinates
export const SULTENG_BOUNDS = {
  minLat: -3.8,
  maxLat: 2.2,
  minLng: 119.0,
  maxLng: 124.5,
};

export function isWithinSulteng(lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return true; // Optional if not provided
  return (
    lat >= SULTENG_BOUNDS.minLat &&
    lat <= SULTENG_BOUNDS.maxLat &&
    lng >= SULTENG_BOUNDS.minLng &&
    lng <= SULTENG_BOUNDS.maxLng
  );
}
