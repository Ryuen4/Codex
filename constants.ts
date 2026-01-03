import { Book } from './types';

export const INITIAL_BOOK: Book = {
  id: 'book_1',
  title: 'The Algorithms of Thought',
  ownerId: 'user_1',
  history: [],
  sessions: [],
  nodes: [
    {
      id: 'node_1',
      bookId: 'book_1',
      type: 'poster',
      title: 'Cover',
      content: '# The Algorithms of Thought\n\n**A Guide to Thinking in Code**',
      order: 0,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_meta',
      bookId: 'book_1',
      type: 'copyright',
      title: 'Copyright',
      content: '**Copyright © 2024 Author Name**\n\nAll rights reserved.',
      order: 1,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_2',
      bookId: 'book_1',
      type: 'preface',
      title: 'Preface',
      content: 'This book explores how computer science concepts can be applied to everyday decision making.',
      order: 2,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_3',
      bookId: 'book_1',
      type: 'toc',
      title: 'Table of Contents',
      content: '(Auto-generated)',
      order: 3,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_4',
      bookId: 'book_1',
      type: 'chapter',
      title: 'Chapter 1: The Stack',
      content: '# Chapter 1: The Stack\n\nLife is often LIFO (Last In, First Out).',
      order: 4,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_5',
      bookId: 'book_1',
      type: 'chapter',
      title: 'Chapter 2: The Queue',
      content: '# Chapter 2: The Queue\n\nFIFO (First In, First Out) is fairer.',
      order: 5,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_6',
      bookId: 'book_1',
      type: 'glossary',
      title: 'Glossary',
      content: '**LIFO**: Last In, First Out.',
      order: 6,
      lastModified: new Date().toISOString(),
      versionCount: 1
    },
    {
      id: 'node_7',
      bookId: 'book_1',
      type: 'about_author',
      title: 'About the Author',
      content: 'The author is a software engineer.',
      order: 7,
      lastModified: new Date().toISOString(),
      versionCount: 1
    }
  ]
};

export const MOCK_USER = {
  id: 'user_1',
  name: 'Author One'
};