'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface WorkflowStepperProps {
  currentStatus: 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI';
  adminName?: string | null;
  updatedAt?: string;
}

export default function WorkflowStepper({
  currentStatus,
  adminName,
  updatedAt,
}: WorkflowStepperProps) {
  const steps = [
    {
      id: 'LAPORAN_MASUK',
      title: '1. Laporan Masuk',
      desc: 'Pengaduan dari Pelapor tercatat dengan koordinat geospasial valid.',
      icon: AlertCircle,
    },
    {
      id: 'DIPROSES',
      title: '2. Investigasi & Konservasi',
      desc: adminName ? `Ditangani oleh Konservator: ${adminName}` : 'Tim konservator turun survei fisik ke lapangan.',
      icon: Clock,
    },
    {
      id: 'SELESAI',
      title: '3. Digitalisasi & Selesai',
      desc: 'Restorasi tuntas, data diarsipkan dan dirilis ke Katalog Publik.',
      icon: CheckCircle2,
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (currentStatus === 'SELESAI') return 'completed';
    if (currentStatus === 'DIPROSES') {
      if (stepId === 'LAPORAN_MASUK') return 'completed';
      if (stepId === 'DIPROSES') return 'active';
      return 'pending';
    }
    if (stepId === 'LAPORAN_MASUK') return 'active';
    return 'pending';
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-sm)',
      padding: '1.25rem',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 540 }}>
          Status Alur Penanganan Cagar Budaya
        </h4>
        {updatedAt && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pembaruan: {new Date(updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        position: 'relative',
      }}>
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          let color = 'var(--text-muted)';
          let borderColor = 'var(--border-subtle)';
          let bgIcon = 'var(--bg-subtle)';

          if (status === 'completed') {
            color = 'var(--status-selesai)';
            borderColor = 'var(--status-selesai-border)';
            bgIcon = 'var(--status-selesai-bg)';
          } else if (status === 'active') {
            color = 'var(--action-primary)';
            borderColor = 'var(--border-active)';
            bgIcon = 'var(--color-terracotta-soft)';
          }

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start',
                padding: '0.85rem',
                borderRadius: 'var(--radius-xs)',
                background: status === 'active' ? 'var(--bg-subtle)' : 'transparent',
                border: `1px solid ${status === 'active' ? 'var(--border-strong)' : 'var(--border-hairline)'}`,
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                background: bgIcon,
                border: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                flexShrink: 0,
              }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 540, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
