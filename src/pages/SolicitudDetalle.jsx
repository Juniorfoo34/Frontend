import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Loader2, Clock, MessageSquare, FileText, CheckCircle } from 'lucide-react';

export default function SolicitudDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sol, setSol] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEstado, setNewEstado] = useState('');
  const [savingEstado, setSavingEstado] = useState(false);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const loadAll = async () => {
    try {
      const [s, h, c, e] = await Promise.all([
        api.getSolicitud(id),
        api.getHistorial(id),
        api.getComentarios(id),
        api.getEstados(),
      ]);
      setSol(s); setHistorial(h); setComentarios(c); setEstados(e);
      setNewEstado(String(s.idEstadoActual));
    } catch (err) {
      toast.error(err.message);
      navigate('/solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const handleEstado = async () => {
    if (!user?.idFuncionario) return toast.error('Solo funcionarios pueden cambiar el estado');
    if (String(newEstado) === String(sol.idEstadoActual)) return toast('El estado es el mismo');
    setSavingEstado(true);
    try {
      await api.cambiarEstado(id, { idEstado: Number(newEstado), idFuncionario: user.idFuncionario });
      toast.success('Estado actualizado');
      loadAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEstado(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      await api.addComentario(id, {
        texto: comment.trim(),
        idFuncionario: user?.idFuncionario || null,
        idUsuario: !user?.idFuncionario ? user?.idUsuario : null,
      });
      setComment('');
      const c = await api.getComentarios(id);
      setComentarios(c);
      toast.success('Comentario agregado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingComment(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link to="/solicitudes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={15} /> Volver a solicitudes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{sol.tipoTramite}</h1>
          <p className="text-sm text-gray-500 mt-1">Solicitud #{sol.idSolicitud} · {sol.fechaCreacion?.split('T')[0]}</p>
        </div>
        <StatusBadge label={sol.nombreEstado} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: main info */}
        <div className="col-span-2 space-y-5">
          {/* Info card */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Información de la solicitud</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Solicitante</p>
                <p className="font-medium">{sol.nombreUsuario}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Funcionario</p>
                <p className="font-medium">{sol.nombreFuncionario}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Unidad</p>
                <p className="font-medium">{sol.nombreUnidad}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Requiere pago</p>
                <p className="font-medium flex items-center gap-1.5">
                  {sol.requierePago ? <><CheckCircle size={14} className="text-green-500" /> Sí — {sol.tienePago === 'Sí' ? 'Pagado' : 'Pendiente'}</> : 'No'}
                </p>
              </div>
              {sol.normativa && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Normativa</p>
                  <p className="text-gray-600">{sol.normativa}</p>
                </div>
              )}
              {sol.descripcion && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Descripción</p>
                  <p className="text-gray-700">{sol.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Change state — only funcionarios */}
          {user?.idFuncionario && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Cambiar estado</h2>
              <div className="flex gap-3">
                <select className="input flex-1" value={newEstado} onChange={e => setNewEstado(e.target.value)}>
                  {estados.map(e => (
                    <option key={e.idEstado} value={e.idEstado}>{e.nombreEstado}</option>
                  ))}
                </select>
                <button onClick={handleEstado} disabled={savingEstado} className="btn-primary whitespace-nowrap">
                  {savingEstado ? <Loader2 size={15} className="animate-spin" /> : null}
                  Actualizar
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <MessageSquare size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Comentarios ({comentarios.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {comentarios.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Sin comentarios aún</p>
              )}
              {comentarios.map(c => (
                <div key={c.idComentario} className={`p-5 ${c.tipoAutor === 'funcionario' ? 'bg-brand-light/30' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${c.tipoAutor === 'funcionario' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {c.autor?.[0]}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{c.autor}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded text-xs
                        ${c.tipoAutor === 'funcionario' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'}`}>
                        {c.tipoAutor === 'funcionario' ? 'Funcionario' : 'Usuario'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{c.fechaComentario?.split('T')[0]}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.texto}</p>
                  {c.adjunto && <p className="text-xs text-brand mt-1.5">📎 {c.adjunto}</p>}
                </div>
              ))}
            </div>
            {/* Add comment */}
            <form onSubmit={handleComment} className="p-5 border-t border-gray-100 flex gap-3">
              <input
                className="input flex-1"
                placeholder="Escribe un comentario..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button type="submit" disabled={sendingComment || !comment.trim()} className="btn-primary px-3">
                {sendingComment ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right: historial */}
        <div className="col-span-1">
          <div className="card">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Historial</h2>
            </div>
            <div className="p-4">
              {historial.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Sin registros</p>
              ) : (
                <div className="space-y-3">
                  {historial.map((h, i) => (
                    <div key={h.idHistorial} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${i === historial.length - 1 ? 'bg-brand' : 'bg-gray-300'}`} />
                        {i < historial.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{h.nombreEstado}</p>
                        <p className="text-xs text-gray-400">{h.nombreFuncionario}</p>
                        <p className="text-xs text-gray-400">{h.fechaCambio?.split('T')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}