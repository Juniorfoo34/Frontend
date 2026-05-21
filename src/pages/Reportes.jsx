import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  BarChart2, Clock, AlertCircle, Loader2,
  RefreshCw, User, FileText,
  TrendingUp, CheckCircle, ShieldOff, Briefcase
} from 'lucide-react';

/* ── Simple bar chart (pure CSS/SVG, no library needed) ── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.totalSolicitudes), 1);
  return (
    <div className="flex items-end gap-3 h-32 pt-4">
      {data.map(d => {
        const pct = (d.totalSolicitudes / max) * 100;
        return (
          <div key={d.estado} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-bold text-gray-700">{d.totalSolicitudes}</span>
            <div
              className="w-full rounded-t-md bg-brand transition-all duration-500"
              style={{ height: `${Math.max(pct, 4)}%`, opacity: 0.7 + (pct / 100) * 0.3 }}
            />
            <span className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2 w-full px-0.5">
              {d.estado}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon: Icon, color = 'text-brand bg-brand-light' }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

/* ── Carga funcionario section ── */
function CargaFuncionario({ funcionarios }) {
  const [idFuncionario, setIdFuncionario] = useState('');
  const [carga, setCarga] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!idFuncionario) return;
    setLoading(true);
    try {
      const data = await api.getCargaFuncionario(idFuncionario);
      setCarga(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCarga(null);
    if (idFuncionario) load();
  }, [idFuncionario]);

  return (
    <div className="card">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
        <Briefcase size={15} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">Carga por funcionario</h2>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <select
            className="input w-72"
            value={idFuncionario}
            onChange={e => setIdFuncionario(e.target.value)}
          >
            <option value="">Seleccionar funcionario...</option>
            {funcionarios.map(f => (
              <option key={f.idFuncionario} value={f.idFuncionario}>
                {f.nombreCompleto} — {f.cargo}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            disabled={!idFuncionario || loading}
            className="btn-secondary"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Actualizar
          </button>
        </div>

        {!idFuncionario && (
          <p className="text-sm text-gray-400 text-center py-6">Selecciona un funcionario para ver su carga de trabajo.</p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
        )}

        {carga && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total asignadas" value={carga.totalSolicitudes ?? 0} icon={FileText} color="text-brand bg-brand-light" />
              <StatCard label="Pendientes" value={carga.totalPendientes ?? 0} icon={Clock} color="text-amber-600 bg-amber-50" />
              <StatCard label="En proceso" value={carga.totalEnProceso ?? 0} icon={BarChart2} color="text-blue-600 bg-blue-50" />
              <StatCard label="Completadas" value={carga.totalCompletadas ?? 0} icon={CheckCircle} color="text-green-600 bg-green-50" />
            </div>

            {/* Breakdown table if the SP returns rows */}
            {Array.isArray(carga.detalle) && carga.detalle.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trámite</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Solicitante</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {carga.detalle.map((s, i) => (
                    <tr key={s.idSolicitud ?? i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.idSolicitud}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{s.tipoTramite}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.descripcion || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-gray-400" />
                          <span className="text-gray-600 text-xs">{s.nombreUsuario}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.fechaCreacion?.split('T')[0]}</td>
                      <td className="px-4 py-3"><StatusBadge label={s.nombreEstado ?? '—'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Reportes() {
  const { user } = useAuth();
  const isFuncionario = Boolean(user?.idFuncionario);

  // Guard: non-funcionarios cannot access this page
  if (!isFuncionario) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm font-medium">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  const [tramites, setTramites]     = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [diasPend, setDiasPend]     = useState(7);
  const [loading, setLoading]       = useState(true);
  const [loadingPend, setLoadingPend] = useState(false);
  const [escalando, setEscalando]   = useState(false);
  const [diasEscalar, setDiasEscalar] = useState(30);

  const loadTramites = async () => {
    try {
      const data = await api.getReporteTramites();
      setTramites(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loadPendientes = async () => {
    setLoadingPend(true);
    try {
      const data = await api.getReportePendientes(diasPend);
      setPendientes(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPend(false);
    }
  };

  const init = async () => {
    setLoading(true);
    await Promise.all([loadTramites(), loadPendientes(), api.getFuncionarios().then(setFuncionarios)]);
    setLoading(false);
  };

  useEffect(() => { init(); }, []);
  useEffect(() => { if (!loading) loadPendientes(); }, [diasPend]);

  const handleEscalar = async () => {
    setEscalando(true);
    try {
      const res = await api.escalarVencidas(diasEscalar);
      toast.success(`${res.solicitudes_escaladas ?? 0} solicitud(es) escalada(s) a "En proceso"`);
      await loadTramites();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEscalando(false);
    }
  };

  const total        = tramites.reduce((s, r) => s + Number(r.totalSolicitudes), 0);
  const completadas  = tramites.find(r => r.estado === 'Completado')?.totalSolicitudes ?? 0;
  const pendTot      = tramites.find(r => r.estado === 'Pendiente')?.totalSolicitudes ?? 0;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-1">Estadísticas y seguimiento del sistema de trámites</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total solicitudes" value={total} icon={FileText} color="text-brand bg-brand-light" />
        <StatCard label="Completadas" value={completadas} icon={CheckCircle} color="text-green-600 bg-green-50" />
        <StatCard label="Pendientes" value={pendTot} icon={Clock} color="text-amber-600 bg-amber-50" />
        <StatCard
          label="Tasa de éxito"
          value={total > 0 ? `${Math.round((completadas / total) * 100)}%` : '—'}
          icon={TrendingUp}
          color="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Chart + Escalation row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Solicitudes por estado</h2>
            <button onClick={loadTramites} className="text-gray-400 hover:text-brand transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
          {tramites.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin datos</p>
          ) : (
            <BarChart data={tramites} />
          )}
        </div>

        {/* Escalation tool */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">Escalar vencidas</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Cambia a <span className="font-medium text-brand">"En proceso"</span> todas las solicitudes
            pendientes que superaron los días indicados sin actualización.
          </p>
          <div className="mb-4">
            <label className="label">Días sin actualizar</label>
            <input
              type="number"
              className="input"
              min={1}
              max={365}
              value={diasEscalar}
              onChange={e => setDiasEscalar(Number(e.target.value))}
            />
          </div>
          <button
            onClick={handleEscalar}
            disabled={escalando}
            className="btn-primary w-full justify-center"
          >
            {escalando ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />}
            Escalar ahora
          </button>
        </div>
      </div>

      {/* Carga por funcionario — cursor 2 */}
      <CargaFuncionario funcionarios={funcionarios} />

      {/* Pending report */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Solicitudes pendientes</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Últimos</span>
            <select
              className="input py-1 text-xs w-24"
              value={diasPend}
              onChange={e => setDiasPend(Number(e.target.value))}
            >
              <option value={3}>3 días</option>
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
            </select>
            <button onClick={loadPendientes} className="text-gray-400 hover:text-brand transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loadingPend ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
        ) : pendientes.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <CheckCircle size={28} className="mb-2 opacity-40 text-green-500" />
            <p className="text-sm">No hay solicitudes pendientes en este período</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trámite</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Funcionario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendientes.map((s, i) => (
                  <tr key={s.idSolicitud ?? i} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">{s.idSolicitud}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{s.tipoTramite}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.descripcion || '—'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-gray-400" />
                        <span className="text-gray-600 text-xs">{s.nombreUsuario}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{s.nombreFuncionario || '—'}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">{s.fechaCreacion?.split('T')[0]}</td>
                    <td className="px-6 py-3">
                      <StatusBadge label={s.nombreEstado ?? 'Pendiente'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-50">
              <p className="text-xs text-gray-400">{pendientes.length} solicitud(es) encontrada(s)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
