import React, { useState, useEffect } from 'react';
import { INITIAL_BOOK } from './constants';
import { Book } from './types';
import { Bookshelf } from './components/Bookshelf';
import { BookWorkspace } from './components/BookWorkspace';
import { createNewBook } from './utils/bookFactory';

const App: React.FC = () => {
  // Load books from localStorage or use initial demo
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('codex_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved books", e);
        return [INITIAL_BOOK];
      }
    }
    return [INITIAL_BOOK];
  });
  
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('codex_theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Persistence for books
  useEffect(() => {
    localStorage.setItem('codex_books', JSON.stringify(books));
  }, [books]);

  // Persistence for theme
  useEffect(() => {
    localStorage.setItem('codex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const activeBook = books.find(b => b.id === activeBookId);

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const handleCreateBook = (title: string) => {
    const newBook = createNewBook(title);
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entire book? This cannot be undone.")) {
      setBooks(prev => prev.filter(b => b.id !== id));
      if (activeBookId === id) setActiveBookId(null);
    }
  };

  const handleImportLibrary = (importedBooks: Book[]) => {
    setBooks(importedBooks);
  };

  if (activeBookId && activeBook) {
    return (
      <BookWorkspace 
        book={activeBook}
        onUpdateBook={handleUpdateBook}
        onBack={() => setActiveBookId(null)}
        theme={theme}
        onToggleTheme={toggleTheme}
        isInstallable={!!installPrompt}
        onInstallApp={handleInstallApp}
      />
    );
  }

  return (
    <Bookshelf 
      books={books}
      onOpenBook={setActiveBookId}
      onCreateBook={handleCreateBook}
      onDeleteBook={handleDeleteBook}
      onImportLibrary={handleImportLibrary}
      theme={theme}
      onToggleTheme={toggleTheme}
      isInstallable={!!installPrompt}
      onInstallApp={handleInstallApp}
    />
  );
};

export default App;