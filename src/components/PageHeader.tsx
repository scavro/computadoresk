import type { ReactNode } from 'react';

export function PageHeader({ title, description, aside }: { title: string; description: string; aside?: ReactNode }) {
  return (
    <section className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {aside && <div className="page-heading-aside">{aside}</div>}
    </section>
  );
}
