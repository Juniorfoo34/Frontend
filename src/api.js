const BASE = import.meta.env.VITE_API_URL || '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

export const api = {
  // Auth
  login: (body) => req('/auth/login', { method: 'POST', body }),

  // Solicitudes
  getSolicitudes:  (params = {}) => req('/solicitudes?' + new URLSearchParams(params)),
  getSolicitud:    (id) => req(`/solicitudes/${id}`),
  createSolicitud: (body) => req('/solicitudes', { method: 'POST', body }),
  updateSolicitud: (id, body) => req(`/solicitudes/${id}`, { method: 'PUT', body }),
  deleteSolicitud: (id) => req(`/solicitudes/${id}`, { method: 'DELETE' }),
  cambiarEstado:   (id, body) => req(`/solicitudes/${id}/estado`, { method: 'PATCH', body }),
  getHistorial:    (id) => req(`/solicitudes/${id}/historial`),
  getComentarios:  (id) => req(`/solicitudes/${id}/comentarios`),
  addComentario:   (id, body) => req(`/solicitudes/${id}/comentarios`, { method: 'POST', body }),

  // Usuarios
  getUsuarios:  () => req('/usuarios'),
  createUsuario:(body) => req('/usuarios', { method: 'POST', body }),
  updateUsuario:(id, body) => req(`/usuarios/${id}`, { method: 'PUT', body }),
  deleteUsuario:(id) => req(`/usuarios/${id}`, { method: 'DELETE' }),

  // Catalogos (lookups)
  getTramites:     () => req('/tramites'),
  getEstados:      () => req('/estados'),
  getFuncionarios: () => req('/funcionarios'),
  getTiposUsuario: () => req('/tipos-usuario'),
  getUnidades:     () => req('/unidades'),

  // Reportes
  getReporteTramites:   () => req('/reportes/tramites'),
  getReportePendientes: (dias = 7) => req(`/reportes/pendientes?dias=${dias}`),
  escalarVencidas:      (dias = 30) => req(`/reportes/escalar?dias=${dias}`, { method: 'POST' }),
  getCargaFuncionario:  (id) => req(`/funcionarios/${id}/carga`),
};