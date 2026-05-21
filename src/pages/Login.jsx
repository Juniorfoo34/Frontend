import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ correoElectronico: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.correoElectronico || !form.contrasena) {
      return toast.error('Completa todos los campos');
    }
    setLoading(true);
    try {
      const data = await api.login(form);
      login(data.user);
      toast.success(`Bienvenido, ${data.user.nombre}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-100/60" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/80 p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-4 shadow-lg shadow-brand/30">
              <GraduationCap size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">UniTrámites</h1>
            <p className="text-sm text-gray-500 mt-1">Portal de Gestión Universitaria</p>
          </div>

          {/* Form */}
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="usuario@universidad.edu"
                  value={form.correoElectronico}
                  onChange={e => set('correoElectronico', e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="••••••••"
                  value={form.contrasena}
                  onChange={e => set('contrasena', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Sistema de gestión de trámites electrónicos
          </p>
        </div>
      </div>
    </div>
  );
}
