import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import HotelCard from '../components/HotelCard';
import type { Hotel } from '../types';
import { Shield, Clock, Star, MapPin } from 'lucide-react';

export default function Home() {
  const { data: hotels = [], isLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: () => api.get('/api/hotels').then(r => r.data),
  });

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge"><MapPin size={14} /> Sri Lanka</span>
          <h1>Discover Sri Lanka's<br />Finest Hotels</h1>
          <p>From ancient fortresses to pristine beaches — find your perfect stay in the Pearl of the Indian Ocean.</p>
          <div className="hero-actions">
            <a href="#hotels" className="btn-primary btn-lg">Explore Hotels</a>
            <Link to="/register" className="btn-outline-white btn-lg">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="why-us">
        <h2>Why Book With Lanka Stay?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Shield size={36} className="feature-icon" />
            <h3>Verified Hotels</h3>
            <p>Every hotel is reviewed and approved by our team before listing.</p>
          </div>
          <div className="feature-card">
            <Clock size={36} className="feature-icon" />
            <h3>Instant Confirmation</h3>
            <p>Book in minutes and receive instant booking confirmation.</p>
          </div>
          <div className="feature-card">
            <Star size={36} className="feature-icon" />
            <h3>Best Experiences</h3>
            <p>Curated selection of Sri Lanka's most unique and memorable stays.</p>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="hotels-section" id="hotels">
        <div className="section-header">
          <h2>Featured Hotels</h2>
          <p>Handpicked stays across Sri Lanka's most beautiful destinations</p>
        </div>
        {isLoading ? (
          <div className="loading-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : hotels.length === 0 ? (
          <p className="empty-state">No hotels available yet.</p>
        ) : (
          <div className="hotels-grid">
            {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
          </div>
        )}
      </section>
    </div>
  );
}
