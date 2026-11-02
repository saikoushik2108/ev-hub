import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import RatingStars from '../../components/common/RatingStars';
import { Star, MessageSquare, CornerDownRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const OwnerReviews = () => {
  const [stations, setStations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState({});
  const [submittingReplyId, setSubmittingReplyId] = useState(null);

  const fetchHostReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/stations');
      if (res.data?.success) {
        setStations(res.data.data);

        // Fetch reviews for each host station
        const allReviews = [];
        for (const st of res.data.data) {
          const revRes = await api.get(`/reviews/station/${st._id}`);
          if (revRes.data?.success) {
            allReviews.push(
              ...revRes.data.data.map((r) => ({ ...r, stationName: st.name }))
            );
          }
        }
        setReviews(allReviews);
      }
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostReviews();
  }, []);

  const handlePostReply = async (reviewId) => {
    const text = replyTextMap[reviewId];
    if (!text || !text.trim()) {
      toast.error('Please enter a response.');
      return;
    }

    setSubmittingReplyId(reviewId);
    try {
      const res = await api.post(`/owner/reviews/${reviewId}/reply`, {
        reply: text.trim(),
      });
      if (res.data?.success) {
        toast.success('Reply posted!');
        setReplyTextMap({ ...replyTextMap, [reviewId]: '' });
        fetchHostReviews();
      }
    } catch (err) {
      toast.error('Failed to post reply.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          Customer Ratings & Reviews
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Read customer feedback and reply to driver reviews across your charging points
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Star size={44} color="#F5B942" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
            No reviews yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            When drivers complete sessions at your charging points, their ratings will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                    {rev.stationName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Driver: <strong>{rev.userId?.name}</strong> • {new Date(rev.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <RatingStars rating={rev.rating} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', margin: '12px 0' }}>
                "{rev.comment}"
              </p>

              {/* Host Reply */}
              {rev.ownerReply?.comment ? (
                <div
                  style={{
                    backgroundColor: 'rgba(57, 242, 138, 0.05)',
                    borderLeft: '3px solid var(--primary-green)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  <strong style={{ color: 'var(--primary-green)' }}>Your Response: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{rev.ownerReply.comment}</span>
                </div>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Write a courteous response to the driver..."
                    className="form-input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    value={replyTextMap[rev._id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev._id]: e.target.value })}
                  />
                  <button
                    type="button"
                    disabled={submittingReplyId === rev._id}
                    onClick={() => handlePostReply(rev._id)}
                    className="btn btn-primary btn-sm"
                  >
                    <Send size={14} /> Reply
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;

