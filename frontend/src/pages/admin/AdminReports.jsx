import React, { useState } from 'react';
import api from '../../services/api';
import { FileDown, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [downloading, setDownloading] = useState('');

  const handleDownloadCSV = async (endpoint, filename) => {
    setDownloading(endpoint);
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate CSV export.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Data Reports & CSV Exports
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Export platform records for accounting, compliance, and offline analytics
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-green-dim)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>
                All Bookings & Reservations CSV
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Contains driver names, host names, start/end timestamps, GMV, platform fees, and status.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadCSV('/admin/reports/csv-bookings', `evhub_bookings_${Date.now()}.csv`)}
            disabled={downloading === '/admin/reports/csv-bookings'}
            className="btn btn-primary btn-sm"
          >
            <FileDown size={16} /> {downloading === '/admin/reports/csv-bookings' ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>
                Financial Transactions & Settlement Ledger CSV
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Contains gross bookings, platform commission (10%), host net payouts, and bank UTR settlement numbers.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadCSV('/admin/reports/csv-transactions', `evhub_transactions_${Date.now()}.csv`)}
            disabled={downloading === '/admin/reports/csv-transactions'}
            className="btn btn-secondary btn-sm"
          >
            <FileDown size={16} /> {downloading === '/admin/reports/csv-transactions' ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

