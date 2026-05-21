import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import toast from 'react-hot-toast';
import { X, Loader2 } from 'lucide-react';

export function SolicitudModal({ solicitud, onClose, onSaved }) {
  const { user } = useAuth();
  const isEdit = Boolean(solicitud);
  const isFuncionario = Boolean(user?.idFuncionario);

  const [form, setForm] = useState({
    descripcion: solicitud?.descripcion || '',
    idUsuario: solicitud?.idUsuario || user?.idUsuario || '',
    idTramite: solicitud?.idTramite || '',
    idFuncionario: solicitud?.idFuncionario || '',
  });
  const [tramites, setTramites] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetches = isFuncionario
      ? [api.getTramites(), api.getFuncionarios(), api.getUsuarios()]
      : [api.getTramites(), api.getFuncionarios()];

    Promise.all(fetches)
      .then(([t, f, u]) => {
        setTramites(t);
        setFuncionarios(f);
        if (u) setUsuarios(u);
      })
      .catch(err => toast.error(err.message));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateSolicitud(solicitud.idSolicitud, {
          descripcion: form.descripcion,
          idFuncionario: Number(form.idFuncionario),
        });
        toast.success('Solicitud actualizada');
      } else {
        await api.createSolicitud({
          descripcion: form.descripcion,
          idUsuario: Number(form.idUsuario),
          idTramite: Number(form.idTramite),
          idFuncionario: Number(form.idFuncionario),
        });
        toast.success('Solicitud creada');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Editar solicitud' : 'Nueva solicitud'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="label">Tipo de trámite</label>
              <select className="input" value={form.idTramite} onChange={e => set('idTramite', e.target.value)} required>
                <option value="">Seleccionar...</option>
                {tramites.map(t => (
                  <option key={t.idTramite} value={t.idTramite}>{t.tipoTramite}</option>
                ))}
              </select>
            </div>
          )}

          {/* Only funcionarios can pick a different solicitante */}
          {!isEdit && isFuncionario && (
            <div>
              <label className="label">Usuario solicitante</label>
              <select className="input" value={form.idUsuario} onChange={e => set('idUsuario', e.target.value)} required>
                <option value="">Seleccionar...</option>
                {usuarios.map(u => (
                  <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido}</option>
                ))}
              </select>
            </div>
          )}

          {/* Non-funcionarios: show read-only label so they know who's submitting */}
          {!isEdit && !isFuncionario && (
            <div>
              <label className="label">Solicitante</label>
              <input
                className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                value={`${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim()}
                readOnly
              />
            </div>
          )}

          <div>
            <label className="label">Funcionario responsable</label>
            <select className="input" value={form.idFuncionario} onChange={e => set('idFuncionario', e.target.value)} required>
              <option value="">Seleccionar...</option>
              {funcionarios.map(f => (
                <option key={f.idFuncionario} value={f.idFuncionario}>{f.nombreCompleto} — {f.cargo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Describa su solicitud..."
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? 'Guardar cambios' : 'Crear solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
