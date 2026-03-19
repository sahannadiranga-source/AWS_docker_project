import { Users, DollarSign } from 'lucide-react';
import type { Room } from '../types';

interface Props {
  room: Room;
  onBook?: (room: Room) => void;
}

export default function RoomCard({ room, onBook }: Props) {
  return (
    <div className="room-card">
      <div className="room-card-img">
        <img
          src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'}
          alt={room.name}
          loading="lazy"
        />
      </div>
      <div className="room-card-body">
        <h4>{room.name}</h4>
        <div className="room-meta">
          <span><Users size={14} /> Up to {room.capacity} guests</span>
          <span className="price"><DollarSign size={14} />${room.pricePerNight}/night</span>
        </div>
        <div className="room-availability">
          {room.availableCount > 0 ? (
            <span className="badge-green">{room.availableCount} available</span>
          ) : (
            <span className="badge-red">Fully booked</span>
          )}
        </div>
        {onBook && (
          <button
            className="btn-primary btn-sm"
            onClick={() => onBook(room)}
            disabled={room.availableCount === 0}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}
