import React, { useState, useRef } from 'react';
import { Book } from '../types';
import { 
  Plus, 
  Trash2, 
  Library, 
  ImageIcon, 
  Sun, 
  Moon, 
  Search, 
  Download, 
  Upload,
  BookOpen,
  DownloadCloud
} from 'lucide-react';

interface BookshelfProps {
  books: Book[];
  onOpenBook: (id: string) => void;
  onCreateBook: (title: string) => void;
  onDeleteBook: (id: string) => void;
  onImportLibrary: (books: Book[]) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ 
  books, 
  onOpenBook, 
  onCreateBook, 
  onDeleteBook, 
  onImportLibrary,
  theme, 
  onToggleTheme,
  isInstallable,
  onInstallApp
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreateBook(newTitle.trim());
      setNewTitle('');
      setIsCreating(false);
    }
  };

  const handleExportLibrary = () => {
    const data = JSON.stringify(books, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codex_library_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            if (window.confirm("Importing a library will replace your current one. Continue?")) {
              onImportLibrary(imported);
            }
          }
        } catch (err) {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-graphite-950 transition-colors duration-500 overflow-y-auto">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportLibrary} 
        accept=".json" 
        className="hidden" 
      />
      
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-16">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-950 dark:bg-graphite-850 rounded-xl flex items-center justify-center text-white dark:text-blue-500 shadow-xl border border-white/5">
              <Library size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-slate-950 dark:text-zinc-200 tracking-tight leading-tight">Codex</h1>
              <p className="text-slate-500 dark:text-zinc-500 font-bold tracking-[0.15em] uppercase text-[9px]">Author Workspace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-graphite-900 border border-slate-200 dark:border-graphite-800 rounded-xl p-1 shadow-sm">
              {isInstallable && (
                <>
                  <button 
                    onClick={onInstallApp}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Install App"
                  >
                    <DownloadCloud size={18} />
                  </button>
                  <div className="w-px h-6 bg-slate-100 dark:bg-graphite-800 mx-1"></div>
                </>
              )}
              <button 
                onClick={handleExportLibrary}
                className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Backup Library"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Restore Library"
              >
                <Upload size={18} />
              </button>
              <div className="w-px h-6 bg-slate-100 dark:bg-graphite-800 mx-1"></div>
              <button 
                onClick={onToggleTheme}
                className="p-2 text-slate-500 hover:text-amber-500 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>

            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-slate-950 dark:bg-graphite-850 text-white dark:text-zinc-100 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-graphite-800 transition-all shadow-lg border border-white/5 active:scale-95"
            >
              <Plus size={14} strokeWidth={3} />
              <span>New Manuscript</span>
            </button>
          </div>
        </header>

        {isCreating && (
          <div className="mb-10 p-8 bg-white dark:bg-graphite-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-graphite-800 animate-in fade-in zoom-in-95 duration-500">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 dark:text-zinc-500 mb-3 uppercase tracking-[0.2em]">Manuscript Identity</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-graphite-700">
                     <Search size={18} />
                   </div>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter working title..."
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-graphite-850 text-slate-950 dark:text-zinc-200 border border-slate-200 dark:border-graphite-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 outline-none text-xl font-serif transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-2 text-xs text-slate-500 dark:text-zinc-500 font-bold hover:text-slate-950 dark:hover:text-zinc-200 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xl active:scale-95 transition-all"
                >
                  Initialize
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between">
             <h2 className="text-[11px] font-black text-slate-400 dark:text-zinc-600 tracking-[0.2em] uppercase">Manuscript Library</h2>
             <div className="h-px flex-1 bg-slate-200 dark:bg-graphite-800 mx-6 hidden sm:block opacity-30"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {books.map(book => (
              <div 
                key={book.id}
                onClick={() => onOpenBook(book.id)}
                className="group flex gap-6 p-6 bg-white dark:bg-graphite-900 rounded-[28px] border border-slate-200 dark:border-graphite-800 hover:border-blue-500/40 shadow-sm hover:shadow-2xl transition-all cursor-pointer items-center relative overflow-hidden"
              >
                <div className="w-28 h-36 bg-slate-100 dark:bg-graphite-850 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 relative shadow-inner">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-graphite-800 bg-slate-50 dark:bg-graphite-900/50">
                      <ImageIcon size={32} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                     <BookOpen size={20} className="text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-between h-32 py-1">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-zinc-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-bold uppercase tracking-widest">
                      v1.0 • Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-500/20">
                          {book.nodes.length} Segments
                        </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteBook(book.id); }}
                      className="p-2 text-slate-300 dark:text-zinc-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {books.length === 0 && !isCreating && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-graphite-900 rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-graphite-800 mb-8 animate-pulse">
                <Library size={40} />
              </div>
              <p className="text-sm font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em]">Vault Empty</p>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-3 max-w-xs mx-auto leading-relaxed">Your creative library is currently unpopulated. Initialize your first manuscript to begin.</p>
              <button 
                 onClick={() => setIsCreating(true)}
                 className="mt-8 px-8 py-3 bg-slate-900 dark:bg-graphite-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-graphite-700 transition-all shadow-xl active:scale-95"
              >
                Create First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};