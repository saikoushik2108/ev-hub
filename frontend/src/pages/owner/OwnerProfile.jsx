import React, { useState } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { Building, ShieldCheck, CreditCard, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerProfile = () => {
  const { user, ownerProfile, refreshMe } = useAuth();

  const [formData, setFormData] = useState({
    street: ownerProfile?.address?.street || '',
    area: ownerProfile?.address?.area || '',
    city: ownerProfile?.address?.city || 'Hyderabad',
    pincode: ownerProfile?.address?.pincode || '',
    bankName: ownerProfile?.payoutDetailsReference?.bankName || '',
    accountNumberMasked: ownerProfile?.payoutDetailsReference?.accountNumberMasked || '',
    ifscCode: ownerProfile?.payoutDetailsReference?.ifscCode || '',
    upiId: ownerProfile?.payoutDetailsReference?.upiId || '',
  });

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Host Profile & Residential Address
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your verified host address and payout bank information
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Verification Status Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOST VERIFICATION STATUS</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>
                {ownerProfile?.verificationStatus === 'VERIFIED' ? 'Approved & Verified Host' : 'Verification Under Review'}
              </h3>
            </div>
            <Badge status={ownerProfile?.verificationStatus || 'PENDING'} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
            Verified hosts receive the green check badge and their approved charging stations appear in driver search results.
          </p>
        </div>

        {/* Address Card */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--primary-green)" /> Confidential Residential Address
          </h3>

          <div className="form-group">
            <label className="form-label">Street / House Address</label>
            <input type="text" className="form-input" value={formData.street} readOnly />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Neighborhood / Area</label>
              <input type="text" className="form-input" value={formData.area} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" value={formData.city} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input type="text" className="form-input" value={formData.pincode} readOnly />
            </div>
          </div>
        </div>

        {/* Payout Details Reference */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="var(--primary-green)" /> Bank Payout Reference
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-input" value={formData.bankName || 'HDFC Bank'} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Masked Account Number</label>
              <input type="text" className="form-input" value={formData.accountNumberMasked || 'XXXX-XXXX-4589'} readOnly />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-input" value={formData.ifscCode || 'HDFC0001234'} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">UPI ID</label>
              <input type="text" className="form-input" value={formData.upiId || 'host@okhdfcbank'} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;

