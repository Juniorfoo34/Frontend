const variants = {
  'Pendiente': 'bg-amber-50 text-amber-700 ring-amber-200',
  'En proceso': 'bg-blue-50 text-blue-700 ring-blue-200',
  'Completado': 'bg-green-50 text-green-700 ring-green-200',
  'Cancelado': 'bg-red-50 text-red-700 ring-red-200',
  'Requiere información adicional': 'bg-purple-50 text-purple-700 ring-purple-200',
};

const dots = {
  'Pendiente': 'bg-amber-400',
  'En proceso': 'bg-blue-500',
  'Completado': 'bg-green-500',
  'Cancelado': 'bg-red-500',
  'Requiere información adicional': 'bg-purple-500',
};

export function StatusBadge({ label }) {
  const cls = variants[label] || 'bg-gray-50 text-gray-600 ring-gray-200';
  const dot = dots[label] || 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
