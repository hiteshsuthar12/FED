import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import BeneficiaryPage from './pages/BeneficiaryPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import DashboardLayout from './components/common/DashboardLayout';
import AdminLayout from './components/common/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}><div className="skeleton w-16 h-16 rounded-full"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}><div className="skeleton w-16 h-16 rounded-full"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/dashboard'} />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute><DashboardLayout><TransferPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/beneficiaries" element={<ProtectedRoute><DashboardLayout><BeneficiaryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><DashboardLayout><TransactionHistoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/transactions" element={<AdminRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '14px 20px', fontSize: '14px' } }} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
