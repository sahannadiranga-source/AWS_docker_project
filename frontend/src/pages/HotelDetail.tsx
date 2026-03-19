import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import { useAuthStore } from '../store/authStore';
import type { Hotel, Room } from '../types';
import { MapPin, ArrowLeft, User } from 'lucide-react';

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: hotel, isLoading } = useQuery<Hotel>({
    queryKey: ['hotel', id],
    queryFn: () => api.get(`/api/hotels/${id}`).then(r => r.data),
  });

  const handleBook = (room: Room) => {
    if (!user) { navigate('/login'); return; }
    setSelectedRoom(room);
  };

  if (isLoading) return <div className="page-loading">Loading hotel...</div>;
  if (!hotel) return <div className="page-loading">Hotel not found.</div>;

  return (
    <div className="hotel-detail">
      <button className="btn-back" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>

      <div className="hotel-hero">
        <img src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'}
          alt={hotel.name} />
        <div className="hotel-hero-overlay">
          <h1>{hotel.name}</h1>
          <p><MapPin size={16} /> {hotel.location}</p>
        </div>
      </div>

      <div className="hotel-detail-body">
        <div className="hotel-info">
          <h2>About This Hotel</h2>
          <p>{hotel.description}</p>
          {hotel.owner && (
            <p className="hotel-owner"><User size={14} /> Managed by {hotel.owner.name}</p>
          )}
        </div>

        <div className="rooms-section">
          <h2>Available Rooms</h2>
          {hotel.rooms && hotel.rooms.length > 0 ? (
            <div className="rooms-grid">
              {hotel.rooms.map(room => (
                <RoomCard key={room.id} room={room} onBook={handleBook} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No rooms available.</p>
          )}
        </div>
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          hotelName={hotel.name}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}
