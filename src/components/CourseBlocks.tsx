import type { ContentBlock } from '../types';

export function CourseBlocks({ blocks }: { blocks: ContentBlock[] | string }) {
  if (typeof blocks === 'string') {
    return <div className="course-blocks">{blocks.split(/\n\s*\n/).map((text, index) => <p key={index}>{text}</p>)}</div>;
  }
  return (
    <div className="course-blocks">
      {blocks.map((block, index) => {
        if (block.type === 'heading') return <h3 key={index}>{block.text}</h3>;
        if (block.type === 'pre') return <pre key={index}>{block.text}</pre>;
        if (block.type === 'caption') return <p className="figure-caption" key={index}>{block.text}</p>;
        if (block.type === 'example') return <section className="example-block" key={index}>{block.title && <h3>{block.title}</h3>}<p>{block.text}</p></section>;
        if (block.type === 'note') return <aside className="note-block" key={index}>{block.title && <strong>{block.title}</strong>}<p>{block.text}</p></aside>;
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
