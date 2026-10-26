export type BlockType = 'paragraph' | 'pre' | 'heading' | 'example' | 'note' | 'caption';

export interface ContentBlock {
  type: BlockType;
  text: string;
  title?: string;
}

export interface TopicSection {
  id: string;
  number: string;
  title: string;
  page: number;
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
  page?: number;
  statement: ContentBlock[] | string;
  solution: ContentBlock[] | string;
}

export interface ExerciseDocument {
  topic: number;
  exercises: CourseExercise[];
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
