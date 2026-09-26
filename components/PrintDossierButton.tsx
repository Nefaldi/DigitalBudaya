'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintDossierButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-outline no-print"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.825rem',
        padding: '0.4rem 0.85rem',
        cursor: 'pointer',
      }}
      title="Cetak lembar registrasi arsip resmi"
    >
      <Printer size={15} />
      <span>Cetak Lembar Registrasi</span>
    </button>
  );
}
