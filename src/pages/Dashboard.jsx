import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText, Clock, CheckCircle, XCircle, AlertCircle,
  ArrowRight, Loader2, TrendingUp
} from 'lucide-react';

const iconMap = {
  'Pendiente': Clock,
  'En proceso': FileText,
  'Completado': CheckCircle,
  'Cancelado': XCircle,
  'Requiere información adicional': AlertCircle,
};

const colorMap = {
  'Pendiente':                     'text-amber-500 bg-amber-50 ring-amber-100',
  'En proceso':                    'text-blue-500 bg-blue-50 ring-blue-100',
  'Completado':                    'text-green-500 bg-green-50 ring-green-100',
  'Cancelado':                     'text-red-500 bg-red-50 ring-red-100',
  'Requiere información adicional':'text-purple-500 bg-purple-50 ring-purple-100',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [reporte, setReporte] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalando, setEscalando] = useState(false);

  const loadData = async () => {

    try {
      // console.log('Cargando datos para usuario:', user);
      setLoading(true);


      const [rep, sols] = await Promise.all([
        api.getReporteTramites(),
        api.getSolicitudes(user?.idFuncionario
          ? { idFuncionario: user.idFuncionario }
          : user?.idUsuario ? { idUsuario: user.idUsuario } : {}
        ),
      ]);
      setReporte(rep);
      setSolicitudes(sols.slice(0, 6));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const total = reporte.reduce((s, r) => s + Number(r.totalSolicitudes), 0);

  const handleEscalar = async () => {
    setEscalando(true);
    try {
      const res = await api.escalarVencidas(30);
      toast.success(`${res.solicitudes_escaladas ?? 0} solicitud(es) escalada(s)`);
      const rep = await api.getReporteTramites();
      setReporte(rep);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEscalando(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bienvenido, <span className="font-medium text-gray-700">{user?.nombre} {user?.apellido}</span>
            {' '}— <span className="text-brand font-medium">{user?.nombreTipoUsuario}</span>
          </p>
        </div>
        {user?.idFuncionario && (
          <button onClick={handleEscalar} disabled={escalando} className="btn-secondary text-xs">
            {escalando ? <Loader2 size={13} className="animate-spin" /> : <AlertCircle size={13} />}
            Escalar vencidas
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {reporte.map(r => {
          const Icon = iconMap[r.estado] || FileText;
          const color = colorMap[r.estado] || 'text-gray-500 bg-gray-50 ring-gray-100';
          return (
            <div key={r.estado} className="card p-4 hover:shadow-card-hover transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ring-1 ${color}`}>
                <Icon size={17} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{r.totalSolicitudes}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{r.estado}</p>
            </div>
          );
        })}

        {/* Total */}
        <div className="card p-4 bg-brand border-brand/20 hover:shadow-card-hover transition-shadow">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/20">
            <TrendingUp size={17} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-white/70 mt-0.5">Total global</p>
        </div>
      </div>

      {/* Recent solicitudes */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Solicitudes recientes</h2>
          <Link
            to="/solicitudes"
            className="flex items-center gap-1 text-xs text-brand hover:underline font-medium"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-gray-400">
            <FileText size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No hay solicitudes aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {solicitudes.map(s => (
              <Link
                key={s.idSolicitud}
                to={`/solicitudes/${s.idSolicitud}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.tipoTramite}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {s.nombreUsuario} · {s.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge label={s.nombreEstado} />
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {s.fechaCreacion?.split('T')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
