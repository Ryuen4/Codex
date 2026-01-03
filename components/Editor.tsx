import React, { useState, useEffect, useRef } from 'react';
import { BookNode, WritingSession } from '../types';
import { 
  Sparkles,
  Bold,
  Italic,
  List,
  Upload,
  Image as ImageIcon,
  X,
  Square,
  CheckSquare
} from 'lucide-react';
import { generateContinuation } from '../services/geminiService';
import { countWords } from '../utils/statsCalculator';

interface EditorProps {
  node: BookNode;
  onUpdate: (id: string, content: string, title: string) => void;
  coverImage?: string;
  onUpdateCover?: (dataUrl: string | undefined) => void;
  isPreview: boolean;
  accentColor: { name: string; color: string; bg: string };
}

export const Editor: React.FC<EditorProps> = ({ 
  node, 
  onUpdate, 
  coverImage, 
  onUpdateCover, 
  isPreview, 
  accentColor 
}) => {
  const [content, setContent] = useState(node.content);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCover = node.type === 'poster';

  useEffect(() => {
    setContent(node.content);
  }, [node.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (content !== node.content) {
        onUpdate(node.id, content, node.title);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [content, node.id, onUpdate, node.title]);

  const handleAIHelp = async () => {
    if (isGenerating || isCover) return;
    setIsGenerating(true);
    const suggestion = await generateContinuation(content, node.title);
    if (suggestion) {
      setContent(prev => prev + '\n\n' + suggestion);
    }
    setIsGenerating(false);
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (isCover) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newContent = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
    setContent(newContent);
    setTimeout(() => { 
      textarea.focus(); 
      textarea.setSelectionRange(start + prefix.length, end + prefix.length); 
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateCover) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatLine = (line: string) => {
    let processed = line;
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Footnote refs [^1]
    processed = processed.replace(/\[\^([^\]]+)\]/g, '<span class="footnote-ref">[$1]</span>');
    return processed;
  };

  const renderPreview = () => {
    const lines = content.split('\n');
    const result: React.ReactNode[] = [];
    const footnotes: Record<string, string> = {};
    
    const filteredLines = lines.filter(line => {
      const match = line.match(/^\[\^([^\]]+)\]:\s+(.*)$/);
      if (match) {
        footnotes[match[1]] = match[2];
        return false;
      }
      return true;
    });

    let currentTable: string[][] = [];
    const flushTable = (index: number) => {
      if (currentTable.length > 0) {
        const headers = currentTable[0];
        const rows = currentTable.slice(2);
        result.push(
          <div key={`table-${index}`} className="md-table-container">
            <table className="md-table">
              <thead>
                <tr>
                  {headers.map((h, hi) => <th key={hi} dangerouslySetInnerHTML={{ __html: formatLine(h.trim()) }} />)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => <td key={ci} dangerouslySetInnerHTML={{ __html: formatLine(cell.trim()) }} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = [];
      }
    };

    filteredLines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        currentTable.push(cells);
        return;
      } else {
        flushTable(i);
      }

      if (line.startsWith('# ')) {
        result.push(<h1 key={i} className="text-4xl font-black mb-10 mt-12 text-slate-900 dark:text-zinc-100 editor-font leading-tight" dangerouslySetInnerHTML={{ __html: formatLine(line.replace('# ', '')) }} />);
      } else if (line.startsWith('## ')) {
        result.push(<h2 key={i} className="text-2xl font-bold mb-8 mt-10 text-slate-800 dark:text-zinc-300 editor-font" dangerouslySetInnerHTML={{ __html: formatLine(line.replace('## ', '')) }} />);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        const listContent = line.substring(2);
        if (listContent.startsWith('[ ] ')) {
          result.push(
            <div key={i} className="task-list-item">
              <Square size={16} className="text-slate-300 dark:text-graphite-700 shrink-0 mt-1.5" />
              <span className="text-xl text-slate-700 dark:text-zinc-400 editor-font" dangerouslySetInnerHTML={{ __html: formatLine(listContent.substring(4)) }} />
            </div>
          );
        } else if (listContent.startsWith('[x] ')) {
          result.push(
            <div key={i} className="task-list-item">
              <CheckSquare size={16} className="text-blue-500 shrink-0 mt-1.5" />
              <span className="text-xl text-slate-400 dark:text-zinc-600 line-through editor-font" dangerouslySetInnerHTML={{ __html: formatLine(listContent.substring(4)) }} />
            </div>
          );
        } else {
          result.push(<li key={i} className="text-xl text-slate-700 dark:text-zinc-400 mb-2 ml-6 list-disc editor-font" dangerouslySetInnerHTML={{ __html: formatLine(listContent) }} />);
        }
      } else if (line.startsWith('> ')) {
        result.push(<blockquote key={i} className="md-preview" dangerouslySetInnerHTML={{ __html: formatLine(line.replace('> ', '')) }} />);
      } else if (trimmed === '') {
        result.push(<div key={i} className="h-6" />);
      } else {
        result.push(<p key={i} className="mb-6 text-xl leading-relaxed text-slate-700 dark:text-zinc-400 editor-font" dangerouslySetInnerHTML={{ __html: formatLine(line) }} />);
      }
    });

    flushTable(filteredLines.length);

    if (Object.keys(footnotes).length > 0) {
      result.push(
        <div key="footnotes" className="footnotes-section">
          {Object.entries(footnotes).map(([id, text]) => (
            <div key={id} className="footnote-item">
              <span className="footnote-label">[{id}]</span>
              <span dangerouslySetInnerHTML={{ __html: formatLine(text) }} />
            </div>
          ))}
        </div>
      );
    }
    return result;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-graphite-950">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      {/* Toolbar - Only show for non-cover nodes */}
      {!isCover && !isPreview && (
        <div className="px-10 py-3 flex items-center justify-center border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-graphite-900/10 shrink-0">
          <div className="flex items-center gap-1 bg-white dark:bg-graphite-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
            <button onClick={() => insertFormat('**', '**')} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Bold"><Bold size={14}/></button>
            <button onClick={() => insertFormat('*', '*')} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Italic"><Italic size={14}/></button>
            <button onClick={() => insertFormat('\n* ', '')} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Bullet"><List size={14}/></button>
            <div className="w-px h-4 bg-slate-200 dark:bg-graphite-800 mx-1"></div>
            <button onClick={handleAIHelp} className={`p-2 transition-colors ${isGenerating ? 'animate-spin' : ''} text-indigo-500`} title="AI Help"><Sparkles size={14}/></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar scroll-smooth">
        <div className="max-w-3xl mx-auto min-h-full">
          {isCover ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-10 animate-in fade-in duration-700">
              {coverImage ? (
                <div className="relative group max-w-sm w-full">
                  <img src={coverImage} className="w-full h-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 transition-transform group-hover:scale-[1.02]" alt="Cover" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onUpdateCover?.(undefined)} 
                      className="p-2.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      title="Remove Cover"
                    >
                      <X size={18}/>
                    </button>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-4 right-4 p-2.5 bg-white/90 dark:bg-graphite-800/90 backdrop-blur text-slate-900 dark:text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-graphite-700"
                    title="Change Cover"
                  >
                    <Upload size={18}/>
                  </button>
                </div>
              ) : (
                <div className="text-center p-16 bg-slate-50 dark:bg-graphite-900 border-2 border-dashed border-slate-200 dark:border-graphite-800 rounded-[3rem] w-full max-w-sm transition-all hover:border-blue-500/50">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-graphite-850 rounded-2xl flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-graphite-700">
                    <ImageIcon size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Cover Visual</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mb-8">Upload a high-fidelity image to represent your work.</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`px-8 py-3.5 ${accentColor.bg} text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-95 transition-all`}
                  >
                    Select Artwork
                  </button>
                </div>
              )}
            </div>
          ) : isPreview ? (
            <div className="animate-in fade-in duration-500 md-preview">
              {renderPreview()}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[70vh] resize-none focus:outline-none editor-font text-xl text-slate-800 dark:text-zinc-300 leading-relaxed bg-transparent placeholder-slate-200 dark:placeholder-graphite-900 pb-32"
              placeholder="The journey begins with a single word..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
      
      <div className="px-10 py-3 border-t border-slate-50 dark:border-white/5 flex justify-between items-center bg-white dark:bg-graphite-950 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
              {isCover ? 'Visual Status' : 'Progress'}
            </span>
            <span className={`text-xs font-bold ${accentColor.color}`}>
              {isCover ? (coverImage ? 'Artwork Active' : 'Waiting for Asset') : `${countWords(content).toLocaleString()} words`}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-100 dark:bg-graphite-900"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Classification</span>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-tighter">{node.type.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};