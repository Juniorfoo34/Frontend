import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Solicitudes from './pages/Solicitudes';
import SolicitudDetalle from './pages/SolicitudDetalle';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/solicitudes" element={<Solicitudes />} />
                <Route path="/solicitudes/:id" element={<SolicitudDetalle />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Outfit, sans-serif',
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#5B5EDE', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
