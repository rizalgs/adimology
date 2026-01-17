'use client';

import { useState, useEffect } from 'react';
import type { StockInput } from '@/lib/types';
import { getDefaultDate } from '@/lib/utils';

interface InputFormProps {
  onSubmit: (data: StockInput) => void;
  loading: boolean;
  initialEmiten?: string | null;
  fromDate: string;
  toDate: string;
  onDateChange: (fromDate: string, toDate: string) => void;
  // Action Button Props
  onCopyText?: () => void;
  onCopyImage?: () => void;
  onAnalyzeAI?: () => void;
  copiedText?: boolean;
  copiedImage?: boolean;
  storyStatus?: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  hasResult?: boolean;
}

export default function InputForm({
  onSubmit,
  loading,
  initialEmiten,
  fromDate,
  toDate,
  onDateChange,
  onCopyText,
  onCopyImage,
  onAnalyzeAI,
  copiedText,
  copiedImage,
  storyStatus,
  hasResult
}: InputFormProps) {
  const [emiten, setEmiten] = useState('SOCI');

  useEffect(() => {
    if (initialEmiten) {
      setEmiten(initialEmiten.toUpperCase());
    }
  }, [initialEmiten]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ emiten, fromDate, toDate });
  };

  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();

    // If days is 0 (1D), it means just today for both
    if (days === 0) {
      // both are today, already default
      // but maybe we want to force reset to today
    } else {
      start.setDate(end.getDate() - days);
    }

    // Format YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    onDateChange(formatDate(start), formatDate(end));
  };

  return (
    <div className="glass-card-static compact-form">
      <form onSubmit={handleSubmit}>
        <div className="compact-form-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Analyze Stock</h3>
          </div>
          <div className="quick-dates">
            <button type="button" onClick={() => setDateRange(0)} className="quick-date-btn">1D</button>
            <button type="button" onClick={() => setDateRange(7)} className="quick-date-btn">1W</button>
            <button type="button" onClick={() => setDateRange(30)} className="quick-date-btn">1M</button>
          </div>
        </div>

        <div className="compact-form-row">
          <div className="input-group compact-group" style={{ flex: '0 0 80px' }}>
            <label htmlFor="emiten" className="input-label compact-label">
              Emiten
            </label>
            <input
              id="emiten"
              type="text"
              className="input-field compact-input"
              value={emiten}
              onChange={(e) => setEmiten(e.target.value.toUpperCase())}
              placeholder="CODE"
              required
            />
          </div>

          <div className="input-group compact-group" style={{ flex: '1' }}>
            <label className="input-label compact-label">
              Date Range
            </label>
            <div className="date-range-group">
              <input
                id="fromDate"
                type="date"
                className="input-field compact-input"
                value={fromDate}
                onChange={(e) => onDateChange(e.target.value, toDate)}
                onClick={(e) => e.currentTarget.showPicker()}
                required
              />
              <span className="date-separator">→</span>
              <input
                id="toDate"
                type="date"
                className="input-field compact-input"
                value={toDate}
                onChange={(e) => onDateChange(fromDate, e.target.value)}
                onClick={(e) => e.currentTarget.showPicker()}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary compact-btn"
              disabled={loading}
              style={{ 
                minWidth: '100px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              {loading ? '...' : 'Adimology'}
            </button>

            <button 
              type="button"
              onClick={onAnalyzeAI}
              disabled={storyStatus === 'pending' || storyStatus === 'processing' || !hasResult}
              className="btn btn-primary compact-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0 1rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #6C63FF, #00C896)',
                border: 'none',
                opacity: hasResult ? 1 : 0.5,
                pointerEvents: hasResult ? 'auto' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {storyStatus === 'pending' || storyStatus === 'processing' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⏳ Analyzing...
                </span>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                  </svg>
                  Analyze Story
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
