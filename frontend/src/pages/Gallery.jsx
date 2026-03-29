import React, { useState, useEffect } from 'react';
import axiosInstance, { API_BASE_URL } from '../api/axios';
import './Gallery.css';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        axiosInstance.get('/gallery')
            .then(res => setImages(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="gallery-container">
            <h1 className="gallery-title fade-in-up">Hostel Facility Previews</h1>
            <p className="gallery-subtitle fade-in-up">Discover state-of-the-art living environments completely renovated natively optimizing student lifestyles seamlessly.</p>

            <div className="gallery-grid">
                {images.map((img, i) => (
                    <div className="gallery-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }} key={img._id || i} onClick={() => setSelectedImage(img)}>
                        <div className="gallery-image-wrapper">
                            <img src={img.url?.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`} alt={img.title} loading="lazy" />
                            <div className="gallery-overlay-badge">View</div>
                        </div>
                        <div className="gallery-info">
                            <h3>{img.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="gallery-modal" onClick={() => setSelectedImage(null)}>
                    <span className="gallery-modal-close" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}>&times;</span>
                    <img className="gallery-modal-content" src={selectedImage.url?.startsWith('http') ? selectedImage.url : `${API_BASE_URL}${selectedImage.url}`} alt={selectedImage.title} onClick={(e) => e.stopPropagation()} />
                    <div className="gallery-modal-caption">{selectedImage.title}</div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
