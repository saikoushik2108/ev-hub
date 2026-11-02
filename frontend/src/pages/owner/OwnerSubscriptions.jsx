import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerSubscriptions = () => {
  const { user, refreshMe } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState('INACTIVE');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/subscription');
      if (res.data?.success) {
        setSubscriptionStatus(res.data.subscriptionStatus);
        setCurrentSubscription(res.data.currentSubscription);
        setPlans(res.data.plans || []);
      }
    } catch (err) {
      toast.error('Failed to load subscription status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleSubscribe = async (plan) => {
    setProcessingPlanId(plan._id);
    try {
      // Step 1: Initiate Razorpay Checkout Order
      const res = await api.post('/owner/subscription/checkout', {
        planId: plan._id,
      });

      if (res.data?.success) {
        const checkoutData = res.data.data;
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';

        if (window.Razorpay && !checkoutData.isSandbox && !keyId.includes('placeholder')) {
          const options = {
            key: keyId,
            amount: Math.round(checkoutData.amount * 100),
            currency: checkoutData.currency || 'INR',
            name: 'EV Hub Host Plan',
            description: `${plan.name} Monthly Subscription`,
            order_id: checkoutData.orderId,
            handler: async (response) => {
              await verifySubscriptionActivation({
                planId: plan._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            theme: { color: '#39F28A' },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Seamless Sandbox Simulation fallback
          toast.loading('Activating host subscription (Instant Test Mode)...', { id: 'sub-pay' });
          setTimeout(async () => {
            toast.dismiss('sub-pay');
            await verifySubscriptionActivation({
              planId: plan._id,
              orderId: checkoutData.orderId,
              paymentId: `sub_pay_test_${Date.now()}`,
              signature: 'mock_sig_valid',
            });
          }, 700);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout initiation failed.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const verifySubscriptionActivation = async (payload) => {
    try {
      const res = await api.post('/owner/subscription/verify', payload);
      if (res.data?.success) {
        toast.success('Subscription activated! Your stations are now publicly listed on the map. ⚡');
        fetchSubscriptionData();
        refreshMe();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment verification failed.');
    }
  };

  const isSubActive = subscriptionStatus === 'ACTIVE';

  return (
    <div style={{ maxWidth: '1080px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Host Subscriptions & Plan Management
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          An active host subscription is required to publicly list your stations on the interactive map
        </p>
      </div>

      {/* Instant Test Mode Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(57, 242, 138, 0.08)',
          border: '1px solid rgba(57, 242, 138, 0.25)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--primary-green)',
          marginBottom: '24px',
        }}
      >
        <Zap size={18} />
        <span>
          <strong>Instant Test Mode:</strong> Select any plan below for immediate 1-click subscription activation. Station visibility is updated instantly without needing payment gateway keys.
        </span>
      </div>

      {/* Current Active Plan Status Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: '36px',
          border: isSubActive ? '1px solid var(--primary-green)' : '1px solid var(--warning)',
          boxShadow: isSubActive ? 'var(--shadow-glow)' : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={24} color={isSubActive ? 'var(--primary-green)' : 'var(--warning)'} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Current Status: {isSubActive ? currentSubscription?.planId?.name || 'Active Host' : 'Inactive / Expired'}
            </h3>
          </div>
          <Badge status={subscriptionStatus} />
        </div>

        {isSubActive ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <div>
              Plan: <strong style={{ color: 'var(--text-main)' }}>{currentSubscription?.planId?.name} (₹{currentSubscription?.amount}/mo)</strong>
            </div>
            <div>
              Valid Through: <strong style={{ color: 'var(--text-main)' }}>{new Date(currentSubscription?.endDate).toLocaleDateString()}</strong>
            </div>
            <div>
              Station Limit: <strong style={{ color: 'var(--text-main)' }}>{currentSubscription?.planId?.stationLimit || 1} Station(s)</strong>
            </div>
            <div style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
              ✓ All stations live on public map
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Your stations are currently hidden from public search and cannot receive new driver bookings.
            Choose a plan below to activate your host network.
          </p>
        )}
      </div>

      {/* Available Plans Grid */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
        Available Host Plans
      </h2>

      <div className="grid-3" style={{ alignItems: 'stretch' }}>
        {plans.map((plan) => {
          const isCurrent = isSubActive && currentSubscription?.planId?._id === plan._id;
          const isPro = plan.code === 'PRO';

          return (
            <div
              key={plan._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '32px',
                border: isPro ? '2px solid var(--primary-green)' : '1px solid var(--border-subtle)',
                position: 'relative',
              }}
            >
              {isPro && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    backgroundColor: 'var(--primary-green)',
                    color: '#090B0A',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  RECOMMENDED
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>{plan.name}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
                  ₹{plan.price}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-green)', marginBottom: '16px' }}>
                  Supports up to {plan.stationLimit} Charging Station{plan.stationLimit > 1 ? 's' : ''}
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '28px' }}>
                  {plan.features?.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="var(--primary-green)" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isCurrent || processingPlanId === plan._id}
                onClick={() => handleSubscribe(plan)}
                className={`btn ${isPro ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%' }}
              >
                {isCurrent
                  ? 'Current Active Plan'
                  : processingPlanId === plan._id
                  ? 'Processing Checkout...'
                  : `Select ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerSubscriptions;

