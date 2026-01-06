'use client';

import { useState, useEffect } from 'react';
import type { StockInput } from '@/lib/types';
import { getDefaultDate } from '@/lib/utils';

interface InputFormProps {
  onSubmit: (data: StockInput) => void;
  loading: boolean;
  initialEmiten?: string | null;
}

export default function InputForm({ onSubmit, loading, initialEmiten }: InputFormProps) {
  const [emiten, setEmiten] = useState('SOCI');
  const [fromDate, setFromDate] = useState(getDefaultDate());
  const [toDate, setToDate] = useState(getDefaultDate());

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
    
    setToDate(formatDate(end));
    setFromDate(formatDate(start));
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card compact-form">
      <div className="compact-form-header">
        <h3>🔍 Analyze Stock</h3>
        <div className="quick-dates">
          <button type="button" onClick={() => setDateRange(0)} className="quick-date-btn">1D</button>
          <button type="button" onClick={() => setDateRange(7)} className="quick-date-btn">1W</button>
          <button type="button" onClick={() => setDateRange(30)} className="quick-date-btn">1M</button>
        </div>
      </div>
      
      <div className="compact-form-row">
        <div className="input-group compact-group" style={{ flex: '0 0 100px' }}>
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
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
            <span className="date-separator">→</span>
            <input
              id="toDate"
              type="date"
              className="input-field compact-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary compact-btn"
          disabled={loading}
        >
          {loading ? '...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
}
