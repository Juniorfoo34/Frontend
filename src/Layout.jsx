import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LayoutDashboard, FileText, Users, BarChart2, LogOut, GraduationCap } from 'lucide-react';

const nav = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/solicitudes', label: 'Solicitudes',  icon: FileText },
  { to: '/usuarios',    label: 'Usuarios',     icon: Users },
  { to: '/reportes',    label: 'Reportes',     icon: BarChart2 },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">UniTrámites</p>
              <p className="text-xs text-gray-400 mt-0.5">Portal universitario</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand font-semibold text-xs">
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-400 truncate">{user?.nombreTipoUsuario}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full justify-center text-xs py-1.5">
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}