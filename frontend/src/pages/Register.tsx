import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Hotel } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const mutation = useMutation({
    mutationFn: () => api.post('/api/auth/register', form),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success('Account created! Welcome to Lanka Stay.');
      navigate('/dashboard');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Registration failed.'),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Hotel size={36} /><span>Lanka Stay</span></div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Lanka Stay today</p>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} placeholder="Your name"
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} placeholder="you@example.com"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} placeholder="Min 6 characters"
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
          </div>
          <p className="role-note">All new accounts start as <strong>User</strong>. You can request Owner access after registering.</p>
          <button type="submit" className="btn-primary btn-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
