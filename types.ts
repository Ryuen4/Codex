export type NodeType = 
  // Front Matter
  | 'poster' 
  | 'half_title'
  | 'title_page' 
  | 'copyright' 
  | 'dedication' 
  | 'epigraph' 
  | 'foreword' 
  | 'preface' 
  | 'toc' 
  
  // Body Matter
  | 'introduction'
  | 'part' 
  | 'chapter' 
  | 'interlude'

  // Back Matter
  | 'conclusion'
  | 'afterword'
  | 'epilogue'
  | 'appendix' 
  | 'glossary' 
  | 'references' 
  | 'index'
  | 'about_author'
  | 'colophon';

export interface WritingSession {
  id: string;
  startTime: string;
  endTime: string;
  wordsAdded: number;
  wordsDeleted: number;
  activeSeconds: number;
  nodeId: string;
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  totalWords: number;
  netWords: number;
  activeSeconds: number;
}

export interface BookNode {
  id: string;
  bookId: string;
  type: NodeType;
  title: string;
  content: string;
  order: number;
  lastModified: string;
  versionCount: number;
}

export interface Book {
  id: string;
  title: string;
  nodes: BookNode[];
  ownerId: string;
  coverImage?: string;
  targetWordCount?: number;
  deadline?: string;
  history: DailySnapshot[];
  sessions: WritingSession[];
}

export interface Link {
  sourceId: string;
  targetId: string;
  anchorText: string;
}

export type ViewMode = 'edit' | 'preview' | 'split' | 'analytics';
