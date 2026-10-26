import { useMemo } from 'react';
import katex from 'katex';

export function MathText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g).filter(Boolean), [text]);
  return (
    <>
      {parts.map((part, index) => {
        const display = part.startsWith('$$');
        if (display || (part.startsWith('$') && part.endsWith('$'))) {
          const source = display ? part.slice(2, -2) : part.slice(1, -1);
          const html = katex.renderToString(source, { displayMode: display, throwOnError: false, strict: 'ignore' });
          return <span key={index} className={display ? 'math math-display' : 'math'} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function MathParagraphs({ paragraphs, className = '' }: { paragraphs: string[]; className?: string }) {
  return <div className={`math-paragraphs ${className}`}>{paragraphs.map((paragraph, index) => <p key={index}><MathText text={paragraph} /></p>)}</div>;
}
