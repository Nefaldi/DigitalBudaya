import React from 'react';

export const metadata = {
  title: 'DigiCulture Care Backend API',
  description: 'RESTful API Service for Sulawesi Tengah Cultural Heritage Preservation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#090d16' }}>{children}</body>
    </html>
  );
}
