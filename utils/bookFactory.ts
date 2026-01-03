import { Book, BookNode, NodeType } from '../types';

export const createNewBook = (title: string = "Untitled Book"): Book => {
  const bookId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  let orderCounter = 0;

  const createNode = (type: NodeType, title: string, content: string): BookNode => ({
    id: `node_${bookId}_${orderCounter}_${Math.random().toString(36).substr(2, 5)}`,
    bookId,
    type,
    title,
    content,
    order: orderCounter++,
    lastModified: timestamp,
    versionCount: 1
  });

  const nodes: BookNode[] = [
    createNode('poster', 'Cover', ''),
    createNode('title_page', 'Title Page', `# ${title}\n\n## A Serious Work\n\n**Author Name**\n\nPublisher Name`),
    createNode('copyright', 'Copyright', `**Copyright © ${new Date().getFullYear()} Author Name**\n\nAll rights reserved.\nISBN: 000-0-00-000000-0`),
    createNode('dedication', 'Dedication', `*For the ones who read.*`),
    createNode('toc', 'Table of Contents', `(Auto-generated placeholder)`),
    createNode('preface', 'Preface', `# Preface\n\nEvery book has a reason for being...`),
    createNode('chapter', 'Chapter 1', `# Chapter 1\n\nThe journey begins here.`),
    createNode('chapter', 'Chapter 2', `# Chapter 2\n\nThe plot thickens.`),
    createNode('chapter', 'Chapter 3', `# Chapter 3\n\nThe resolution approaches.`),
    createNode('about_author', 'About the Author', `# About the Author\n\nWrite your bio here.`),
    createNode('references', 'References', `# References\n\n1. Source One\n2. Source Two`),
  ];

  return {
    id: bookId,
    title,
    ownerId: 'user_1',
    nodes,
    history: [],
    sessions: []
  };
};

export const getCategoryForType = (type: NodeType): 'Front Matter' | 'Body' | 'Back Matter' => {
  const frontMatter: NodeType[] = ['poster', 'half_title', 'title_page', 'copyright', 'dedication', 'epigraph', 'foreword', 'preface', 'toc'];
  const backMatter: NodeType[] = ['conclusion', 'afterword', 'epilogue', 'appendix', 'glossary', 'references', 'index', 'about_author', 'colophon'];
  
  if (frontMatter.includes(type)) return 'Front Matter';
  if (backMatter.includes(type)) return 'Back Matter';
  return 'Body';
};