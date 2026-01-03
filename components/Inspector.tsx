import React from 'react';
import { BookNode } from '../types';
import { 
  Link2, 
  Calendar, 
  FileType, 
  X, 
  Palette, 
  BarChart3, 
  Download,
  Info,
  Layers
} from 'lucide-react';

interface InspectorProps {
  node: BookNode;
  allNodes: BookNode[];
  onNodeClick: (id: string) => void;
  onClose?: () => void;
  accent: { name: string; color: string; bg: string };
  onSetAccent: (accent: any) => void;
  onShowAnalytics: () => void;
  onExport: () => void;
}

const ACCENTS = [
  { name: 'Indigo', color: 'text-indigo-500', bg: 'bg-indigo-500' },
  { name: 'Emerald', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { name: 'Rose', color: 'text-rose-500', bg: 'bg-rose-500' },
  { name: 'Amber', color: 'text-amber-500', bg: 'bg-amber-500' },
  { name: 'Blue', color: 'text-blue-500', bg: 'bg-blue-500' },
];

export const Inspector: React.FC<InspectorProps> = ({ 
  node, 
  allNodes, 
  onNodeClick, 
  onClose, 
  accent, 
  onSetAccent,
  onShowAnalytics,
  onExport
}) => {
  
  const backlinks = allNodes.filter(n => 
    n.id !== node.id && n.content.includes(`[[${node.title}]]`)
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-graphite-900 overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0 bg-white dark:bg-graphite-950">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Studio Panel</h3>
        <button onClick={onClose} className="lg:hidden text-zinc-500"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Accent Picker Section */}
        <section>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Palette size={12} className={accent.color} /> Session Mood
          </h4>
          <div className="flex gap-2">
            {ACCENTS.map(c => (
              <button 
                key={c.name}
                onClick={() => onSetAccent(c)}
                className={`w-7 h-7 rounded-lg ${c.bg} transition-all ${accent.name === c.name ? 'ring-2 ring-offset-2 ring-offset-graphite-900 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </section>

        {/* Node Properties */}
        <section className="bg-white dark:bg-graphite-850 rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm">
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Metadata</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500 flex items-center gap-2"><FileType size={12} /> Class</span>
              <span className={`font-bold uppercase ${accent.color}`}>{node.type}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500 flex items-center gap-2"><Calendar size={12} /> Sync</span>
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{new Date(node.lastModified).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500 flex items-center gap-2"><Layers size={12} /> Versions</span>
              <span className="text-slate-700 dark:text-zinc-300 font-medium">v{node.versionCount || 1}</span>
            </div>
          </div>
        </section>

        {/* Links / Connections */}
        <section>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Link2 size={12} className="text-indigo-500" /> Connections
          </h4>
          {backlinks.length > 0 ? (
            <div className="space-y-2">
              {backlinks.map(bn => (
                <button 
                  key={bn.id}
                  onClick={() => onNodeClick(bn.id)}
                  className="w-full text-left p-3 rounded-xl bg-white dark:bg-graphite-850 border border-slate-200 dark:border-white/5 hover:border-blue-500 transition-all text-[11px]"
                >
                  <div className="font-bold text-slate-800 dark:text-zinc-100">{bn.title}</div>
                  <div className="text-[9px] text-zinc-500 mt-1 line-clamp-1 italic">Mentions this segment...</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-slate-200 dark:border-graphite-800 rounded-2xl text-center">
              <Info size={16} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[9px] text-slate-400 uppercase tracking-tighter">No Linked Backlinks</p>
            </div>
          )}
        </section>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-graphite-950 space-y-3">
        <button 
          onClick={onShowAnalytics}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-graphite-850 text-slate-700 dark:text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <BarChart3 size={14} /> Insights
        </button>
        <button 
          onClick={onExport}
          className={`flex items-center justify-center gap-2 w-full py-2.5 ${accent.bg} text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all`}
        >
          <Download size={14} /> Export Work
        </button>
      </div>
    </div>
  );
};