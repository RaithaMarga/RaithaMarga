import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const roleParam = allowedRole ? `?role=${allowedRole}` : '';
    return <Navigate to={`/login${roleParam}`} state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    const targetDashboard = user?.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
