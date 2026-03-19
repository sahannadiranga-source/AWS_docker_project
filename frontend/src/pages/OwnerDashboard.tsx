import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import type { Booking, Hotel, OwnerAnalytics } from '../types';
import { Plus, TrendingUp, CalendarDays, Hotel as HotelIcon, MapPin } from 'lucide-react';

type Tab = 'hotels' | 'bookings' | 'analytics';

export default function OwnerDashboard() {
  const [tab, setTab] = useState<Tab>('hotels');
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState<number | null>(null);
  const qc = useQueryClient();

  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['owner-hotels'],
    queryFn: () => api.get('/api/owner/hotels').then(r => r.data),
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['owner-bookings'],
    queryFn: () => api.get('/api/owner/bookings').then(r => r.data),
    enabled: tab === 'bookings',
  });

  const { data: analytics = [] } = useQuery<OwnerAnalytics[]>({
    queryKey: ['owner-analytics'],
    queryFn: () => api.get('/api/owner/analytics').then(r => r.data),
    enabled: tab === 'analytics',
  });

  const [hotelForm, setHotelForm] = useState({ name: '', description: '', location: '', imageUrl: '' });
  const createHotel = useMutation({
    mutationFn: () => api.post('/api/owner/hotels', hotelForm),
    onSuccess: () => { toast.success('Hotel submitted for approval!'); qc.invalidateQueries({ queryKey: ['owner-hotels'] }); setShowHotelForm(false); setHotelForm({ name: '', description: '', location: '', imageUrl: '' }); },
    onError: () => toast.error('Failed to create hotel.'),
  });

  const [roomForm, setRoomForm] = useState({ name: '', pricePerNight: '', capacity: '', imageUrl: '', availableCount: '' });
  const createRoom = useMutation({
    mutationFn: (hotelId: number) => api.post('/api/owner/rooms', {
      hotelId,
      name: roomForm.name,
      pricePerNight: parseFloat(roomForm.pricePerNight),
      capacity: parseInt(roomForm.capacity),
      imageUrl: roomForm.imageUrl || null,
      availableCount: parseInt(roomForm.availableCount),
    }),
    onSuccess: () => { toast.success('Room added!'); qc.invalidateQueries({ queryKey: ['owner-hotels'] }); setShowRoomForm(null); setRoomForm({ name: '', pricePerNight: '', capacity: '', imageUrl: '', availableCount: '' }); },
    onError: () => toast.error('Failed to add room.'),
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div><h1>Owner Dashboard</h1><p>Manage your hotels and bookings</p></div>
        {tab === 'hotels' && (
          <button className="btn-primary" onClick={() => setShowHotelForm(true)}>
            <Plus size={16} /> Add Hotel
          </button>
        )}
      </div>

      <div className="tabs">
        {(['hotels', 'bookings', 'analytics'] as Tab[]).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Hotels Tab */}
      {tab === 'hotels' && (
        <div>
          {showHotelForm && (
            <div className="form-card">
              <h3>New Hotel</h3>
              <div className="form-group"><label>Name</label><input value={hotelForm.name} onChange={e => setHotelForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label>Description</label><textarea value={hotelForm.description} onChange={e => setHotelForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="form-group"><label>Location</label><input value={hotelForm.location} onChange={e => setHotelForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="form-group"><label>Image URL</label><input value={hotelForm.imageUrl} onChange={e => setHotelForm(f => ({ ...f, imageUrl: e.target.value }))} /></div>
              <div className="form-actions">
                <button className="btn-primary" onClick={() => createHotel.mutate()} disabled={createHotel.isPending}>Submit</button>
                <button className="btn-outline" onClick={() => setShowHotelForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="owner-hotels-list">
            {hotels.map(h => (
              <div key={h.id} className="owner-hotel-card">
                <div className="owner-hotel-header">
                  <div>
                    <h3><HotelIcon size={16} /> {h.name}</h3>
                    <p><MapPin size={13} /> {h.location}</p>
                  </div>
                  <div className="hotel-status">
                    <span className={h.isApproved ? 'badge-green' : 'badge-yellow'}>
                      {h.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <button className="btn-outline btn-sm" onClick={() => setShowRoomForm(h.id)}>
                      <Plus size={14} /> Add Room
                    </button>
                  </div>
                </div>
                {showRoomForm === h.id && (
                  <div className="form-card nested">
                    <h4>Add Room to {h.name}</h4>
                    <div className="form-row">
                      <div className="form-group"><label>Room Name</label><input value={roomForm.name} onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))} /></div>
                      <div className="form-group"><label>Price/Night ($)</label><input type="number" value={roomForm.pricePerNight} onChange={e => setRoomForm(f => ({ ...f, pricePerNight: e.target.value }))} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Capacity</label><input type="number" value={roomForm.capacity} onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))} /></div>
                      <div className="form-group"><label>Available Count</label><input type="number" value={roomForm.availableCount} onChange={e => setRoomForm(f => ({ ...f, availableCount: e.target.value }))} /></div>
                    </div>
                    <div className="form-group"><label>Image URL</label><input value={roomForm.imageUrl} onChange={e => setRoomForm(f => ({ ...f, imageUrl: e.target.value }))} /></div>
                    <div className="form-actions">
                      <button className="btn-primary" onClick={() => createRoom.mutate(h.id)} disabled={createRoom.isPending}>Add Room</button>
                      <button className="btn-outline" onClick={() => setShowRoomForm(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                {h.rooms && h.rooms.length > 0 && (
                  <div className="rooms-mini-list">
                    {h.rooms.map((r: any) => (
                      <div key={r.id} className="room-mini">
                        <span>{r.name}</span>
                        <span>${r.pricePerNight}/night</span>
                        <span>{r.availableCount} avail.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="bookings-list">
          {bookings.length === 0 ? <p className="empty-state">No bookings yet.</p> : bookings.map(b => (
            <div key={b.id} className={`booking-card status-${b.status.toLowerCase()}`}>
              <div className="booking-info">
                <h3>{b.hotel?.name} — {b.room?.name}</h3>
                <p>{b.guestName} · {b.guestEmail}</p>
                <div className="booking-dates">
                  <CalendarDays size={13} /> {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}
                </div>
                <div className="booking-footer">
                  <span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span>
                  <strong>${b.totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {tab === 'analytics' && (
        <div className="analytics-grid">
          {analytics.map(a => (
            <div key={a.hotelId} className="analytics-card">
              <h3><TrendingUp size={18} /> {a.hotelName}</h3>
              <div className="stat-row"><span>Total Bookings</span><strong>{a.totalBookings}</strong></div>
              <div className="stat-row"><span>Total Revenue</span><strong>${a.totalRevenue.toFixed(2)}</strong></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
