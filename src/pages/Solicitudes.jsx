import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { SolicitudModal } from '../components/SolicitudModal';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Pencil, Eye, Loader2, FileText } from 'lucide-react';

export default function Solicitudes() {
  const { user } = useAuth();
  const isFuncionario = Boolean(user?.idFuncionario);

  const [data, setData] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | solicitudObj
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = isFuncionario ? {} : { idUsuario: user.idUsuario };
      const [sols, ests] = await Promise.all([api.getSolicitudes(params), api.getEstados()]);
      setData(sols);
      setEstados(ests);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta solicitud? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await api.deleteSolicitud(id);
      toast.success('Solicitud eliminada');
      setData(d => d.filter(s => s.idSolicitud !== id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = data.filter(s => {
    const matchSearch = !search ||
      s.tipoTramite?.toLowerCase().includes(search.toLowerCase()) ||
      s.nombreUsuario?.toLowerCase().includes(search.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || String(s.idEstadoActual) === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-1">{data.length} solicitudes en total</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} /> Nueva solicitud
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por trámite, usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-52" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.map(e => (
            <option key={e.idEstado} value={e.idEstado}>{e.nombreEstado}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No se encontraron solicitudes</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Trámite</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitante</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Funcionario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.idSolicitud} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.idSolicitud}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.tipoTramite}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{s.descripcion || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.nombreUsuario}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.nombreFuncionario}</td>
                  <td className="px-4 py-3"><StatusBadge label={s.nombreEstado} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{s.fechaCreacion?.split('T')[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/solicitudes/${s.idSolicitud}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand-light transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => setModal(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                        <Pencil size={15} />
                      </button>
                      {isFuncionario && (
                        <button onClick={() => handleDelete(s.idSolicitud)} disabled={deleting === s.idSolicitud}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          {deleting === s.idSolicitud ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <SolicitudModal
          solicitud={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
