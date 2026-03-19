import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  role?: 'Admin' | 'Owner' | 'User';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'Admin' && user.role !== 'Admin') return <Navigate to="/" replace />;
  if (role === 'Owner' && user.role !== 'Owner' && user.role !== 'Admin') return <Navigate to="/" replace />;

  return <>{children}</>;
}
