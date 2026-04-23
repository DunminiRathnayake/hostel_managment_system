import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axios';

const ReviewsPanel = () => {
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); 

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reviewsRes, avgRes] = await Promise.all([
                axiosInstance.get('/reviews'),
                axiosInstance.get('/reviews/average')
            ]);
            setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
            setAverage(avgRes.data || { average: 0, total: 0 });
        } catch (err) {
            setError('Could not fetch hostel reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await axiosInstance.delete(`/reviews/${id}`);
            setReviews(prev => prev.filter(r => r._id !== id));
            const avgRes = await axiosInstance.get('/reviews/average');
            setAverage(avgRes.data);
        } catch (err) {
            alert('Failed to delete review');
        }
    };

    const filteredReviews = useMemo(() => {
        if (!Array.isArray(reviews)) return [];
        if (activeFilter === 'positive') return reviews.filter(r => (r.rating || 0) >= 4);
        if (activeFilter === 'critical') return reviews.filter(r => (r.rating || 0) <= 2);
        return reviews;
    }, [reviews, activeFilter]);

    const starBreakdown = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (Array.isArray(reviews)) {
            reviews.forEach(r => { 
                const rate = Math.round(r.rating) || 0;
                if (counts[rate] !== undefined) counts[rate]++; 
            });
        }
        return counts;
    }, [reviews]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>📊 Loading reviews dashboard...</div>;

    return (
        <div className="panel-container fade-in">
            <h1 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ background: '#3b82f6', color: 'white', padding: '0.5rem', borderRadius: '12px', fontSize: '1.2rem', display: 'flex' }}>📈</span>
                Hostel Performance & Student Reviews
            </h1>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="stat-card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Average Rating</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0ea5e9' }}>{average.average || 0} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ 5</span></div>
                    <div style={{ marginTop: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ color: s <= Math.round(Number(average.average) || 0) ? '#fbbf24' : '#e2e8f0', fontSize: '1.2rem' }}>★</span>
                        ))}
                    </div>
                </div>

                <div className="stat-card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Rating Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const total = reviews.length || 0;
                            const count = starBreakdown[star] || 0;
                            const percent = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '0.75rem', minWidth: '40px' }}>{star} Star</span>
                                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${percent}%`, background: '#fbbf24' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{Math.round(percent)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="stat-card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Reviews</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>{average.total || 0}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                 <button onClick={() => setActiveFilter('all')} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', background: activeFilter === 'all' ? '#0f172a' : '#f1f5f9', color: activeFilter === 'all' ? 'white' : '#64748b', border: 'none' }}>
                    All
                 </button>
                 <button onClick={() => setActiveFilter('positive')} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', background: activeFilter === 'positive' ? '#10b981' : '#f1f5f9', color: activeFilter === 'positive' ? 'white' : '#64748b', border: 'none' }}>
                    Positive
                 </button>
                 <button onClick={() => setActiveFilter('critical')} style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', background: activeFilter === 'critical' ? '#ef4444' : '#f1f5f9', color: activeFilter === 'critical' ? 'white' : '#64748b', border: 'none' }}>
                    Critical
                 </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredReviews.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No reviews found for this filter.</div>
                ) : (
                    filteredReviews.map(r => (
                        <div key={r._id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontWeight: 'bold' }}>{r.studentName || 'Anonymous'}</div>
                                <div style={{ color: '#fbbf24' }}>
                                    {'★'.repeat(Math.min(5, Math.max(0, Math.round(r.rating || 0))))}
                                </div>
                            </div>
                            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>"{r.comment || 'No comment provided.'}"</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Unknown Date'}</span>
                                <button 
                                    onClick={() => handleDelete(r._id)}
                                    style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewsPanel;
