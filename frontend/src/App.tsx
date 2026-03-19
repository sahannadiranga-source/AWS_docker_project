import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import HotelDetail from './pages/HotelDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><UserDashboard /></ProtectedRoute>
            } />
            <Route path="/owner" element={
              <ProtectedRoute role="Owner"><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
