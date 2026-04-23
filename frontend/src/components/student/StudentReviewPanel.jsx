import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const StudentReviewPanel = () => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [existing, setExisting] = useState(false);

    useEffect(() => {
        const fetchExistingReview = async () => {
            try {
                // If a review exists, it will populate because the controller logic checks our ID
                // But wait, our API doesn't have a GET /me. Oh, GET /api/reviews returns all. 
                // We shouldn't rely on GET /api/reviews to find ours if the list is huge.
                // Let's just fetch all and find ours.
                const res = await axiosInstance.get('/reviews');
                const userObj = JSON.parse(localStorage.getItem('user'));
                const myReview = res.data.find(r => r.user === userObj?.id || r.user === userObj?._id);
                if (myReview) {
                    setRating(myReview.rating);
                    setComment(myReview.comment);
                    setExisting(true);
                }
            } catch (err) {
                console.error("Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };
        fetchExistingReview();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setSaving(true);
        try {
            const method = existing ? 'put' : 'post';
            await axiosInstance[method]('/reviews', { rating, comment });
            setMessage(existing ? 'Review updated successfully!' : 'Review posted successfully!');
            setExisting(true);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading your review status...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">{existing ? 'Update Your Review' : 'Rate Your Hostel Experience'}</h1>
            
            <div className="form-card" style={{ maxWidth: '600px' }}>
                {message && <div style={{ padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group-alt">
                        <label>Your Rating ({rating} / 5)</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                    key={star} 
                                    onClick={() => setRating(star)} 
                                    style={{ 
                                        fontSize: '2rem', 
                                        cursor: 'pointer', 
                                        color: star <= rating ? '#fbbf24' : '#e2e8f0',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group-alt">
                        <label>Your Feedback (Comment)</label>
                        <textarea 
                            required 
                            rows="5"
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            placeholder="Tell us what you loved or what we can improve..."
                            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" disabled={saving} className="action-btn" style={{ padding: '1rem', background: '#3b82f6', color: 'white', fontWeight: 'bold' }}>
                        {saving ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentReviewPanel;
