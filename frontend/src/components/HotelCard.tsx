import { Link } from 'react-router-dom';
import { MapPin, BedDouble, DollarSign } from 'lucide-react';
import type { Hotel } from '../types';

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="hotel-card">
      <div className="hotel-card-img">
        <img
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
          alt={hotel.name}
          loading="lazy"
        />
      </div>
      <div className="hotel-card-body">
        <h3>{hotel.name}</h3>
        <p className="hotel-location"><MapPin size={14} /> {hotel.location}</p>
        <p className="hotel-desc">{hotel.description.slice(0, 100)}...</p>
        <div className="hotel-meta">
          <span><BedDouble size={14} /> {hotel.roomCount ?? 0} rooms</span>
          {hotel.minPrice ? (
            <span className="price"><DollarSign size={14} />From ${hotel.minPrice}/night</span>
          ) : null}
        </div>
        <Link to={`/hotels/${hotel.id}`} className="btn-primary btn-sm">View Hotel</Link>
      </div>
    </div>
  );
}
