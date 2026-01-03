import React, { useState } from 'react';
import { Book, BookNode, WritingSession } from '../types';
import { Sidebar } from './Sidebar';
import { Editor } from './Editor';
import { Inspector } from './Inspector';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { 
  Download, 
  Menu, 
  PanelRight, 
  ChevronLeft, 
  BarChart3, 
  Sun, 
  Moon,
  Sparkles,
  Eye,
  Edit3,
  Check
} from 'lucide-react';

interface BookWorkspaceProps {
  book: Book;
  onUpdateBook: (updatedBook: Book) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const BookWorkspace: React.FC<BookWorkspaceProps> = ({ book, onUpdateBook, onBack, theme, onToggleTheme }) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(book.nodes[0]?.id || null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isInspectorOpen, setInspectorOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [accent, setAccent] = useState({ name: 'Blue', color: 'text-blue-500', bg: 'bg-blue-500' });
  const [isSaving, setIsSaving] = useState(false);

  const activeNode = book.nodes.find(n => n.id === activeNodeId) || null;

  const handleUpdateNode = (id: string, newContent: string, newTitle: string) => {
    setIsSaving(true);
    onUpdateBook({
      ...book,
      nodes: book.nodes.map(n => 
        n.id === id ? { ...n, content: newContent, title: newTitle, lastModified: new Date().toISOString() } : n
      )
    });
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleUpdateCover = (dataUrl: string | undefined) => {
    onUpdateBook({ ...book, coverImage: dataUrl });
  };

  const handleAddNode = () => {
    const newNode: BookNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      bookId: book.id,
      type: 'chapter',
      title: 'New Chapter',
      content: '# New Chapter\n\nStart writing here...',
      order: book.nodes.length,
      lastModified: new Date().toISOString(),
      versionCount: 1
    };
    onUpdateBook({ ...book, nodes: [...book.nodes, newNode] });
    setActiveNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    if (window.confirm("Delete this segment?")) {
      const newNodes = book.nodes.filter(n => n.id !== id);
      onUpdateBook({ ...book, nodes: newNodes });
      if (activeNodeId === id) setActiveNodeId(newNodes[0]?.id || null);
    }
  };

  const handleExport = () => {
    const fullText = book.nodes.map(n => n.content).join('\n\n---\n\n');
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showAnalytics) {
    return <AnalyticsDashboard book={book} onBack={() => setShowAnalytics(false)} theme={theme} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-graphite-950 text-slate-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* 1. Left Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-100 dark:bg-graphite-900 border-r border-slate-200 dark:border-graphite-800 transform transition-transform duration-300
        md:relative md:translate-x-0 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:opacity-0 md:overflow-hidden'}
      `}>
        <Sidebar 
          nodes={book.nodes} 
          activeNodeId={activeNodeId} 
          onSelectNode={setActiveNodeId}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* 2. Main Center Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-graphite-950 transition-colors">
        
        {/* Refined Unified Header */}
        <div className="h-12 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-graphite-950 flex items-center justify-between px-4 z-20 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
             <button 
               onClick={() => setSidebarOpen(!isSidebarOpen)}
               className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-graphite-850 rounded-md transition-colors"
               title="Toggle Sidebar"
             >
               <Menu size={18} />
             </button>
             
             <button onClick={onBack} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors">
               <ChevronLeft size={16} />
             </button>

             <div className="h-4 w-px bg-slate-200 dark:bg-graphite-850 mx-1"></div>

             <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-graphite-900 rounded-lg border border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{book.title}</span>
                <span className="text-slate-300 dark:text-graphite-700">/</span>
                <input 
                  type="text" 
                  value={activeNode?.title || ''} 
                  onChange={(e) => activeNode && handleUpdateNode(activeNode.id, activeNode.content, e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-[10px] font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-widest w-32 truncate"
                  placeholder="UNTITLED"
                  disabled={activeNode?.type === 'poster'}
                />
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isSaving && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse mr-2">Syncing</span>}
            {!isSaving && <Check size={14} className="text-emerald-500 mr-2" />}

            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-graphite-850 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'}`}
            >
              {isPreview ? <Edit3 size={12} /> : <Eye size={12} />}
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>

            <button onClick={onToggleTheme} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 rounded-md">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button onClick={() => setInspectorOpen(!isInspectorOpen)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 rounded-md">
              <PanelRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          {activeNode ? (
            <Editor 
              node={activeNode} 
              onUpdate={handleUpdateNode}
              coverImage={book.coverImage}
              onUpdateCover={handleUpdateCover}
              isPreview={isPreview}
              accentColor={accent}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 dark:text-graphite-800 uppercase tracking-[0.3em] font-black text-xs">
              Select a segment
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Inspector */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-graphite-900 border-l border-slate-200 dark:border-graphite-800 transform transition-transform duration-300
        lg:relative lg:translate-x-0 shrink-0
        ${isInspectorOpen ? 'translate-x-0' : 'translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden'}
      `}>
         {activeNode && (
            <Inspector 
              node={activeNode} 
              allNodes={book.nodes}
              onNodeClick={setActiveNodeId}
              onClose={() => setInspectorOpen(false)}
              accent={accent}
              onSetAccent={setAccent}
              onShowAnalytics={() => setShowAnalytics(true)}
              onExport={handleExport}
            />
         )}
      </div>
    </div>
  );
};