'use client';

import { useState, useEffect } from 'react';
import { getBrokerInfo } from '@/lib/brokers';

interface AnalysisRecord {
  id: number;
  from_date: string;
  emiten: string;
  sector?: string;
  bandar?: string;
  barang_bandar?: number;
  rata_rata_bandar?: number;
  harga?: number;
  ara?: number;
  arb?: number;
  target_realistis?: number;
  target_max?: number;
  real_harga?: number;
  max_harga?: number;
  status: string;
  error_message?: string;
}

interface EmitenHistoryCardProps {
  emiten: string;
}

export default function EmitenHistoryCard({ emiten }: EmitenHistoryCardProps) {
  const [data, setData] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (emiten) {
      fetchHistory();
    }
  }, [emiten]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch 5 most recent records
      const params = new URLSearchParams({
        emiten: emiten.toUpperCase(),
        limit: '5',
        sortBy: 'from_date',
        sortOrder: 'desc',
      });

      const response = await fetch(`/api/watchlist-history?${params}`);
      const json = await response.json();

      if (json.success) {
        // Reverse to show ascending (oldest to newest) as requested
        const sortedData = (json.data || []).reverse();
        setData(sortedData);
      }
    } catch (error) {
      console.error('Error fetching emiten history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => num?.toLocaleString() ?? '-';
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // Match "23-Jan" format from screenshot
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' }).replace('.', '');
    return `${day}-${month}`;
  };

  const calculateGain = (price: number | undefined, target: number | undefined) => {
    if (!price || !target || price === 0) return null;
    const gain = ((target - price) / price) * 100;
    return `${gain >= 0 ? '+' : ''}${gain.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat riwayat {emiten}...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="glass-card-static" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📊 Riwayat Analisis {emiten} (5 Terakhir)</h3>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ background: 'var(--bg-secondary)' }}>
            <tr>
              <th style={{ whiteSpace: 'nowrap', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Date ↓
              </th>
              <th style={{ whiteSpace: 'nowrap', padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Emiten</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Harga</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target R1</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Max</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Max Harga</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Close Harga</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bandar</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vol Bandar</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Bandar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr
                key={record.id}
                style={{
                  borderBottom: index < data.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  transition: 'background 0.2s ease'
                }}
              >
                <td style={{ padding: '0.6rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{formatDate(record.from_date)}</td>
                <td style={{ padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '0.8rem' }}>{record.emiten}</div>
                  {record.sector && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {record.sector}
                    </div>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>
                  {formatNumber(record.harga)}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                    {formatNumber(record.target_realistis)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {calculateGain(record.harga, record.target_realistis)}
                  </div>
                </td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: 'var(--accent-warning)' }}>
                    {formatNumber(record.target_max)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {calculateGain(record.harga, record.target_max)}
                  </div>
                </td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', verticalAlign: 'middle' }}>
                  {record.max_harga ? (
                    <>
                      <div style={{ 
                        fontWeight: 700, 
                        fontVariantNumeric: 'tabular-nums', 
                        fontSize: '0.85rem',
                        color: record.target_max && record.max_harga >= record.target_max
                          ? 'var(--accent-warning)'
                          : (record.target_realistis && record.max_harga >= record.target_realistis
                            ? 'var(--accent-success)'
                            : (record.harga && record.max_harga > record.harga
                              ? '#F59E0B' // Orange if reached profit area
                              : 'var(--accent-warning)'))
                      }}>
                        {formatNumber(record.max_harga)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {calculateGain(record.harga, record.max_harga)}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', verticalAlign: 'middle' }}>
                  {record.real_harga ? (
                    <>
                      <div style={{ 
                        fontWeight: 700, 
                        fontVariantNumeric: 'tabular-nums', 
                        fontSize: '0.85rem',
                        color: record.target_realistis && record.real_harga >= record.target_realistis
                          ? 'var(--accent-success)'
                          : (record.harga && record.real_harga > record.harga
                            ? '#F59E0B' // Yellow/Orange for profit but below target
                            : 'var(--accent-warning)') // Red for loss
                      }}>
                        {formatNumber(record.real_harga)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {calculateGain(record.harga, record.real_harga)}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#ffffff', fontSize: '0.75rem', verticalAlign: 'middle' }}>
                  {record.bandar ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{record.bandar}</span>
                      {(() => {
                        const brokerInfo = getBrokerInfo(record.bandar);
                        const displayType = brokerInfo.type === 'Smartmoney' ? 'Smart Money' : brokerInfo.type;
                        return (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-secondary)', 
                            opacity: 0.9,
                            background: 'rgba(255,255,255,0.08)',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            {displayType}
                          </span>
                        );
                      })()}
                    </div>
                  ) : '-'}
                </td>
                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#ffffff', fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}>
                  {formatNumber(record.barang_bandar)}
                </td>
                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>
                    {formatNumber(record.rata_rata_bandar)}
                  </div>
                  {record.rata_rata_bandar && record.harga && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {calculateGain(record.rata_rata_bandar, record.harga)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
