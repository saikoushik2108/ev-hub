import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { HelpCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UserSupport = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'EQUIPMENT_FAULT',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/complaints');
      if (res.data?.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/user/complaints', formData);
      if (res.data?.success) {
        toast.success('Support ticket submitted successfully!');
        setFormData({ subject: '', description: '', category: 'EQUIPMENT_FAULT' });
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Customer Support & Issue Resolution
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Have an issue with a station, payment, or host? Our operations team is here to assist 24/7.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Ticket Submission Form */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--primary-green)" /> Submit Support Ticket
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="EQUIPMENT_FAULT">Hardware / Charger Fault</option>
                <option value="ACCESS_ISSUE">Host Location / Access Issue</option>
                <option value="OVERCHARGED">Billing / Overcharge Dispute</option>
                <option value="HOST_BEHAVIOR">Host Conduct & Amenities</option>
                <option value="OTHER">Other Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief summary of the issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                className="form-textarea"
                placeholder="Please describe what happened, including station name and timing..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ minHeight: '120px' }}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px' }}>
            Ticket History ({complaints.length})
          </h3>

          {loading ? (
            <div className="skeleton" style={{ height: '180px' }} />
          ) : complaints.length === 0 ? (
            <div className="card-elevated" style={{ textAlign: 'center', padding: '36px 16px' }}>
              <CheckCircle2 size={36} color="var(--primary-green)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                No active complaints or support tickets.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {complaints.map((c) => (
                <div key={c._id} className="card-elevated" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.subject}</div>
                    <Badge status={c.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 600, marginBottom: '6px' }}>
                    {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {c.description}
                  </p>

                  {c.adminNotes && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-card)',
                        borderLeft: '3px solid var(--primary-green)',
                        fontSize: '0.8rem',
                      }}
                    >
                      <strong style={{ color: 'var(--primary-green)' }}>Admin Resolution: </strong>
                      <span style={{ color: 'var(--text-main)' }}>{c.adminNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSupport;

