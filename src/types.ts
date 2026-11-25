export type BlockType = 'paragraph' | 'pre' | 'heading' | 'example' | 'note' | 'caption' | 'figure';

export interface ContentBlock {
  type: BlockType;
  text: string;
  title?: string;
  src?: string;
  alt?: string;
}

export interface TopicSection {
  id: string;
  number: string;
  title: string;
  page: number;
  pdfPage?: number;
  blocks: ContentBlock[];
}

export interface Topic {
  id: number;
  title: string;
  subtitle?: string;
  source: string;
  totalPages: number;
  sections: TopicSection[];
}

export interface CourseExercise {
  id: string;
  number: string;
  origin?: string;
  page?: number;
  statement: ContentBlock[] | string;
  solution: ContentBlock[] | string;
}

export interface CacheQuizItem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ExerciseDocument {
  topic: number;
  exercises: CourseExercise[];
  quiz?: CacheQuizItem[];
}

export interface SourceDocument {
  id: string;
  title: string;
  file: string;
  pages?: number;
  description: string;
}

export interface SourcesFile {
  documents: SourceDocument[];
}
