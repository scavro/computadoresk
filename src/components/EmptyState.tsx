import { FileWarning, LoaderCircle } from 'lucide-react';

export function LoadingState() {
  return <div className="empty-state" role="status"><LoaderCircle className="spin" /><h2>Cargando el material local…</h2></div>;
}

export function EmptyState({ title = 'Material local no disponible', children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <FileWarning size={34} />
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
