import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

const GalleryPanel = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchImages = async () => {
        try {
            const res = await axiosInstance.get('/gallery');
            setImages(res.data || []);
        } catch (err) {
            console.error('Failed to fetch gallery', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchImages(); }, []);

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert('Please select an image file');
        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', imageFile);

        try {
            await axiosInstance.post('/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setTitle('');
            setImageFile(null);
            document.getElementById('gallery-file-input').value = '';
            fetchImages();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upload image. Max 5MB, format: jpg, jpeg, png.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await axiosInstance.delete(`/gallery/${id}`);
            fetchImages();
        } catch (err) {
            alert('Failed to delete image');
        }
    };

    if (loading) return <div style={{ color: '#64748b' }}>Loading Gallery Settings...</div>;

    return (
        <div className="panel-container">
            <h1 className="panel-title">Gallery Setup</h1>

            <div className="form-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
                <h3>Add New Image</h3>
                <form onSubmit={handleAddImage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" placeholder="Image Title (e.g., Premium Suite)" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    <input type="file" id="gallery-file-input" accept="image/jpeg, image/jpg, image/png" onChange={e => setImageFile(e.target.files[0])} required style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    <button type="submit" disabled={uploading} className="action-btn">
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                </form>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Title</th>
                            <th>Date Added</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {images.map(img => (
                            <tr key={img._id}>
                                <td>
                                    <img src={`http://localhost:5000${img.url}`} alt={img.title} style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td>{img.title}</td>
                                <td>{new Date(img.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn btn-danger" onClick={() => handleDelete(img._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {images.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No images configured.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GalleryPanel;
