import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Hotel } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const mutation = useMutation({
    mutationFn: () => api.post('/api/auth/login', form),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Owner') navigate('/owner');
      else navigate('/dashboard');
    },
    onError: () => toast.error('Invalid email or password.'),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Hotel size={36} /><span>Lanka Stay</span></div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} placeholder="you@example.com"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} placeholder="••••••••"
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Register</Link></p>
        <div className="demo-creds">
          <p>Demo credentials:</p>
          <code>admin@lankastay.com / Admin@123</code><br />
          <code>owner@lankastay.com / Owner@123</code>
        </div>
      </div>
    </div>
  );
}
