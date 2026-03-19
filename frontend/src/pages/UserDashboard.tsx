import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Booking } from '../types';
import { CalendarDays, MapPin, XCircle, Building2 } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/api/bookings/my').then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/bookings/${id}/cancel`),
    onSuccess: () => { toast.success('Booking cancelled.'); qc.invalidateQueries({ queryKey: ['my-bookings'] }); },
    onError: () => toast.error('Could not cancel booking.'),
  });

  const requestOwner = useMutation({
    mutationFn: () => api.post('/api/auth/request-owner'),
    onSuccess: () => toast.success('Owner request submitted! Awaiting admin approval.'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Request failed.'),
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        {user?.role === 'User' && (
          <button className="btn-outline" onClick={() => requestOwner.mutate()} disabled={requestOwner.isPending}>
            <Building2 size={16} /> Request Hotel Owner Access
          </button>
        )}
      </div>

      <h2>My Bookings</h2>
      {isLoading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state-box">
          <CalendarDays size={48} />
          <p>No bookings yet. <a href="/">Explore hotels</a></p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b.id} className={`booking-card status-${b.status.toLowerCase()}`}>
              <div className="booking-img">
                <img src={b.hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'}
                  alt={b.hotel.name} />
              </div>
              <div className="booking-info">
                <h3>{b.hotel.name}</h3>
                <p><MapPin size={13} /> {b.hotel.location}</p>
                <p className="room-name">{b.room.name}</p>
                <div className="booking-dates">
                  <span><CalendarDays size={13} /> {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div className="booking-footer">
                  <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                  <strong>${b.totalPrice.toFixed(2)}</strong>
                </div>
              </div>
              {b.status === 'Confirmed' && (
                <button className="btn-danger btn-sm"
                  onClick={() => cancelMutation.mutate(b.id)}
                  disabled={cancelMutation.isPending}>
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
