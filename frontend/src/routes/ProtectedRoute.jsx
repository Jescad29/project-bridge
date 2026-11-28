import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};