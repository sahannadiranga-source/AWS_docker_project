import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import type { AdminAnalytics, Hotel } from '../types';
import { CheckCircle, XCircle, Users, Building2, TrendingUp, Clock, CalendarDays } from 'lucide-react';

type Tab = 'analytics' | 'hotels' | 'owners' | 'users';

interface PendingUser { id: number; name: string; email: string; role: string; createdAt: string; }

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('analytics');
  const qc = useQueryClient();

  const { data: analytics } = useQuery<AdminAnalytics>({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/api/admin/analytics').then(r => r.data),
  });

  const { data: pendingHotels = [] } = useQuery<Hotel[]>({
    queryKey: ['pending-hotels'],
    queryFn: () => api.get('/api/admin/hotels/pending').then(r => r.data),
    enabled: tab === 'hotels',
  });

  const { data: pendingOwners = [] } = useQuery<PendingUser[]>({
    queryKey: ['pending-owners'],
    queryFn: () => api.get('/api/admin/users/pending').then(r => r.data),
    enabled: tab === 'owners',
  });

  const { data: allUsers = [] } = useQuery<PendingUser[]>({
    queryKey: ['all-users'],
    queryFn: () => api.get('/api/admin/users').then(r => r.data),
    enabled: tab === 'users',
  });

  const approveHotel = useMutation({
    mutationFn: (id: number) => api.put(`/api/admin/hotels/${id}/approve`),
    onSuccess: () => { toast.success('Hotel approved!'); qc.invalidateQueries({ queryKey: ['pending-hotels'] }); qc.invalidateQueries({ queryKey: ['admin-analytics'] }); },
  });

  const rejectHotel = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/hotels/${id}/reject`),
    onSuccess: () => { toast.success('Hotel rejected.'); qc.invalidateQueries({ queryKey: ['pending-hotels'] }); },
  });

  const approveOwner = useMutation({
    mutationFn: (id: number) => api.put(`/api/admin/users/${id}/approve`),
    onSuccess: () => { toast.success('Owner approved!'); qc.invalidateQueries({ queryKey: ['pending-owners'] }); qc.invalidateQueries({ queryKey: ['admin-analytics'] }); },
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div><h1>Admin Dashboard</h1><p>Manage the Lanka Stay platform</p></div>
      </div>

      {/* Stats bar */}
      {analytics && (
        <div className="stats-bar">
          <div className="stat-card"><TrendingUp size={24} /><div><span>Revenue</span><strong>${analytics.totalRevenue.toFixed(2)}</strong></div></div>
          <div className="stat-card"><Building2 size={24} /><div><span>Hotels</span><strong>{analytics.totalHotels}</strong></div></div>
          <div className="stat-card"><Users size={24} /><div><span>Users</span><strong>{analytics.totalUsers}</strong></div></div>
          <div className="stat-card"><CalendarDays size={24} /><div><span>Bookings</span><strong>{analytics.totalBookings}</strong></div></div>
          <div className="stat-card pending"><Clock size={24} /><div><span>Pending Hotels</span><strong>{analytics.pendingHotels}</strong></div></div>
          <div className="stat-card pending"><Clock size={24} /><div><span>Pending Owners</span><strong>{analytics.pendingOwners}</strong></div></div>
        </div>
      )}

      <div className="tabs">
        {(['analytics', 'hotels', 'owners', 'users'] as Tab[]).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === 'analytics' && analytics && (
        <div className="analytics-grid">
          <div className="analytics-card"><h3>Total Revenue</h3><p className="big-number">${analytics.totalRevenue.toFixed(2)}</p></div>
          <div className="analytics-card"><h3>Total Bookings</h3><p className="big-number">{analytics.totalBookings}</p></div>
          <div className="analytics-card"><h3>Registered Users</h3><p className="big-number">{analytics.totalUsers}</p></div>
          <div className="analytics-card"><h3>Approved Hotels</h3><p className="big-number">{analytics.totalHotels}</p></div>
          <div className="analytics-card warn"><h3>Pending Hotels</h3><p className="big-number">{analytics.pendingHotels}</p></div>
          <div className="analytics-card warn"><h3>Pending Owners</h3><p className="big-number">{analytics.pendingOwners}</p></div>
        </div>
      )}

      {/* Pending Hotels */}
      {tab === 'hotels' && (
        <div>
          <h2>Pending Hotel Approvals</h2>
          {pendingHotels.length === 0 ? <p className="empty-state">No pending hotels.</p> : (
            <div className="admin-list">
              {pendingHotels.map((h: any) => (
                <div key={h.id} className="admin-list-item">
                  <div className="admin-item-info">
                    {h.imageUrl && <img src={h.imageUrl} alt={h.name} className="admin-thumb" />}
                    <div>
                      <h3>{h.name}</h3>
                      <p>{h.location}</p>
                      <p className="text-muted">Owner: {h.owner?.name} ({h.owner?.email})</p>
                      <p className="text-muted">{h.description?.slice(0, 100)}...</p>
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button className="btn-success" onClick={() => approveHotel.mutate(h.id)} disabled={approveHotel.isPending}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button className="btn-danger" onClick={() => rejectHotel.mutate(h.id)} disabled={rejectHotel.isPending}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Owners */}
      {tab === 'owners' && (
        <div>
          <h2>Pending Owner Requests</h2>
          {pendingOwners.length === 0 ? <p className="empty-state">No pending owner requests.</p> : (
            <div className="admin-list">
              {pendingOwners.map(u => (
                <div key={u.id} className="admin-list-item">
                  <div className="admin-item-info">
                    <div>
                      <h3>{u.name}</h3>
                      <p>{u.email}</p>
                      <p className="text-muted">Requested: {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button className="btn-success" onClick={() => approveOwner.mutate(u.id)} disabled={approveOwner.isPending}>
                      <CheckCircle size={16} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Users */}
      {tab === 'users' && (
        <div>
          <h2>All Users</h2>
          <div className="users-table">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td><span className={(u as any).isApproved ? 'badge-green' : 'badge-yellow'}>{(u as any).isApproved ? 'Active' : 'Pending'}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


