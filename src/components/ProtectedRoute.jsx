import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ allowedRole, children }) => {
  const { user, isAuthenticated, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role="status" aria-live="polite">Checking your sign-in…</div>;
  }

  if (authError) {
    return (
      <div role="alert">
        Could not verify your account with the backend: {authError} Please check the Firebase/backend configuration and reload.
      </div>
    );
  }

  if (!isAuthenticated) {
    const roleParam = allowedRole ? `?role=${allowedRole}` : '';
    return <Navigate to={`/login${roleParam}`} state={{ from: location }} replace />;
  }

  if (!user?.role) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    const dashboards = { admin: '/admin/dashboard', buyer: '/buyer/dashboard', farmer: '/farmer/dashboard' };
    const targetDashboard = dashboards[user?.role] || '/';
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
