import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import type { Room } from '../types';
import { X } from 'lucide-react';

interface Props {
  room: Room;
  hotelName: string;
  onClose: () => void;
}

export default function BookingModal({ room, hotelName, onClose }: Props) {
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    checkInDate: today,
    checkOutDate: '',
    guestName: '',
    guestEmail: '',
    guestCount: 1,
  });

  const nights =
    form.checkOutDate && form.checkInDate
      ? Math.max(0, (new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) / 86400000)
      : 0;

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/api/bookings', {
        roomId: room.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestCount: form.guestCount,
      }),
    onSuccess: () => {
      toast.success('Booking confirmed!');
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['hotel'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Booking failed.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) return toast.error('Check-out must be after check-in.');
    mutation.mutate();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book {room.name}</h3>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>
        <p className="modal-subtitle">{hotelName} · ${room.pricePerNight}/night</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Check-in</label>
              <input type="date" min={today} value={form.checkInDate}
                onChange={e => setForm(f => ({ ...f, checkInDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input type="date" min={form.checkInDate || today} value={form.checkOutDate}
                onChange={e => setForm(f => ({ ...f, checkOutDate: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Guest Name</label>
            <input type="text" value={form.guestName}
              onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Guest Email</label>
            <input type="email" value={form.guestEmail}
              onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Guests (max {room.capacity})</label>
            <input type="number" min={1} max={room.capacity} value={form.guestCount}
              onChange={e => setForm(f => ({ ...f, guestCount: +e.target.value }))} required />
          </div>
          {nights > 0 && (
            <div className="price-summary">
              <span>{nights} night{nights > 1 ? 's' : ''} × ${room.pricePerNight}</span>
              <strong>Total: ${(nights * room.pricePerNight).toFixed(2)}</strong>
            </div>
          )}
          <button type="submit" className="btn-primary btn-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
