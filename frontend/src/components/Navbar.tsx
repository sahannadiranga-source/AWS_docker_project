import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Hotel, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <Hotel size={28} />
          <span>Lanka Stay</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            {user.role === 'Admin' && <Link to="/admin"><LayoutDashboard size={16} /> Admin</Link>}
            {(user.role === 'Owner') && <Link to="/owner"><LayoutDashboard size={16} /> Dashboard</Link>}
            {user.role === 'User' && <Link to="/dashboard"><User size={16} /> My Bookings</Link>}
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
