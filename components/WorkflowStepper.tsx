'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface WorkflowStepperProps {
  currentStatus: 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI';
  adminName?: string | null;
  updatedAt?: string;
  compact?: boolean;
}

export default function WorkflowStepper({
  currentStatus,
  adminName,
  updatedAt,
  compact = false,
}: WorkflowStepperProps) {
  const steps = [
    {
      id: 'LAPORAN_MASUK',
      title: '1. Laporan Masuk',
      desc: 'Laporan tercatat dan menunggu verifikasi.',
      icon: AlertCircle,
    },
    {
      id: 'DIPROSES',
      title: '2. Investigasi Lapangan',
      desc: adminName ? `Ditangani oleh: ${adminName}` : 'Sedang dalam survei konservator.',
      icon: Clock,
    },
    {
      id: 'SELESAI',
      title: '3. Selesai & Terbit',
      desc: 'Preservasi selesai dan masuk katalog publik.',
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

  if (compact) {
    return (
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Status Penanganan
          </span>
          {adminName && currentStatus !== 'LAPORAN_MASUK' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--action-primary)', fontWeight: 500 }}>
              Konservator: {adminName}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', position: 'relative' }}>
          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            const isDone = status === 'completed';
            const isActive = status === 'active';

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.6rem',
                  borderRadius: '8px',
                  background: isActive ? 'var(--bg-surface)' : isDone ? 'rgba(46, 125, 50, 0.08)' : 'transparent',
                  border: isActive ? '1px solid var(--border-strong)' : isDone ? '1px solid var(--status-selesai-border)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isDone
                      ? 'var(--status-selesai-bg)'
                      : isActive
                      ? 'var(--color-terracotta-soft)'
                      : 'var(--bg-canvas)',
                    color: isDone
                      ? 'var(--status-selesai)'
                      : isActive
                      ? 'var(--action-primary)'
                      : 'var(--text-muted)',
                    border: `1px solid ${
                      isDone
                        ? 'var(--status-selesai-border)'
                        : isActive
                        ? 'var(--action-primary)'
                        : 'var(--border-hairline)'
                    }`,
                  }}
                >
                  <Icon size={13} />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isDone ? 'var(--status-selesai)' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {idx + 1}. {step.id === 'LAPORAN_MASUK' ? 'Masuk' : step.id === 'DIPROSES' ? 'Investigasi' : 'Selesai'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {isDone ? 'Selesai' : isActive ? 'Sedang Berjalan' : 'Antrean'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: '16px',
      padding: '1.25rem',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 540 }}>
          Status Penanganan
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
            borderColor = 'var(--border-strong)';
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
