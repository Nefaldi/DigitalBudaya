import React from 'react';
import LoadingScreen from '@/components/LoadingScreen';

export default function RootLoading() {
  return (
    <LoadingScreen
      message="Memuat DigiCulture Care..."
      submessage="Menghubungkan sistem pengarsipan cagar budaya Sulawesi Tengah"
      fullScreen={true}
    />
  );
}
