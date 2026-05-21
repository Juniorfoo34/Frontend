import { useEffect, useState } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, Loader2, Users,
  X, Mail, Phone, User, Shield
} from 'lucide-react';

/* ── User Modal ──────────────────────────────────────────── */
function UsuarioModal({ usuario, tiposUsuario, onClose, onSaved }) {
  const isEdit = Boolean(usuario);
  const [form, setForm] = useState({
    nombre:             usuario?.nombre             || '',
    apellido:           usuario?.apellido           || '',
    correoElectronico:  usuario?.correoElectronico  || '',
    telefono:           usuario?.telefono           || '',
    contrasena:         '',
    idTipoUsuario:      usuario?.idTipoUsuario      || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateUsuario(usuario.idUsuario, {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono || null,
          idTipoUsuario: Number(form.idTipoUsuario),
        });
        toast.success('Usuario actualizado');
      } else {
        if (!form.contrasena) return toast.error('La contraseña es requerida');
        await api.createUsuario({
          nombre:            form.nombre,
          apellido:          form.apellido,
          correoElectronico: form.correoElectronico,
          telefono:          form.telefono || null,
          contrasena:        form.contrasena,
          idTipoUsuario:     Number(form.idTipoUsuario),
        });
        toast.success('Usuario creado');
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handle} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" placeholder="Juan" required
                value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input className="input" placeholder="Pérez" required
                value={form.apellido} onChange={e => set('apellido', e.target.value)} />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="label">Correo electrónico</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" type="email" placeholder="usuario@universidad.edu" required
                  value={form.correoElectronico} onChange={e => set('correoElectronico', e.target.value)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input pl-9" placeholder="300 000 0000"
                  value={form.telefono} onChange={e => set('telefono', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Tipo de usuario</label>
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select className="input pl-9" required
                  value={form.idTipoUsuario} onChange={e => set('idTipoUsuario', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {tiposUsuario.map(t => (
                    <option key={t.idTipoUsuario} value={t.idTipoUsuario}>{t.nombreTipoUsuario}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="••••••••" required
                value={form.contrasena} onChange={e => set('contrasena', e.target.value)} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function Usuarios() {
  const [data, setData]               = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [modal, setModal]             = useState(null); // null | 'create' | usuarioObj
  const [deleting, setDeleting]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [usuarios, tipos] = await Promise.all([
        api.getUsuarios(),
        api.getTiposUsuario(),
      ]);
      setData(usuarios);
      setTiposUsuario(tipos);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    try {
      await api.deleteUsuario(id);
      toast.success('Usuario eliminado');
      setData(d => d.filter(u => u.idUsuario !== id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = data.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q) ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correoElectronico?.toLowerCase().includes(q) ||
      u.nombreTipoUsuario?.toLowerCase().includes(q)
    );
  });

  const initials = (u) =>
    `${u.nombre?.[0] || ''}${u.apellido?.[0] || ''}`.toUpperCase();

  const avatarColor = (id) => {
    const colors = [
      'bg-brand text-white',
      'bg-green-500 text-white',
      'bg-amber-500 text-white',
      'bg-rose-500 text-white',
      'bg-cyan-500 text-white',
      'bg-violet-500 text-white',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{data.length} usuarios registrados</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre, correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Users size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No se encontraron usuarios</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Solicitudes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.idUsuario} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(u.idUsuario)}`}>
                        {initials(u)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.nombre} {u.apellido}</p>
                        <p className="text-xs text-gray-400 font-mono">#{u.idUsuario}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.correoElectronico}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand">
                      <Shield size={10} />
                      {u.nombreTipoUsuario}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      {u.totalSolicitudes ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.fechaRegistro?.split('T')[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(u)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.idUsuario)}
                        disabled={deleting === u.idUsuario}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {deleting === u.idUsuario
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
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
        <UsuarioModal
          usuario={modal === 'create' ? null : modal}
          tiposUsuario={tiposUsuario}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
