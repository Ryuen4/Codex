import React, { useMemo } from 'react';
import { BookNode, NodeType } from '../types';
import { getCategoryForType } from '../utils/bookFactory';
import { 
  Book as BookIcon, 
  FileText, 
  Plus, 
  Trash2,
  X,
  List,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  nodes: BookNode[];
  activeNodeId: string | null;
  onSelectNode: (id: string) => void;
  onAddNode: () => void;
  onDeleteNode: (id: string) => void;
  onClose?: () => void;
}

const NodeIcon = ({ type }: { type: NodeType }) => {
  switch (type) {
    case 'poster': return <BookIcon size={14} className="text-blue-500" />;
    case 'chapter': return <FileText size={14} className="text-zinc-400" />;
    case 'toc': return <List size={14} className="text-zinc-500" />;
    default: return <FileText size={14} className="text-zinc-600" />;
  }
};

const SectionHeader = ({ title, count }: { title: string, count: number }) => (
  <div className="px-4 py-2 mt-5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-600 select-none">
    <span>{title}</span>
    {count > 0 && <span className="text-[8px] bg-slate-100 dark:bg-graphite-850 px-1.5 py-0.5 rounded-md">{count}</span>}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ 
  nodes, 
  activeNodeId, 
  onSelectNode, 
  onAddNode,
  onDeleteNode,
  onClose
}) => {
  
  const groupedNodes = useMemo(() => {
    const groups = {
      'Front Matter': [] as BookNode[],
      'Body': [] as BookNode[],
      'Back Matter': [] as BookNode[]
    };
    nodes.forEach(node => {
      const category = getCategoryForType(node.type);
      groups[category].push(node);
    });
    return groups;
  }, [nodes]);

  const renderNode = (node: BookNode) => (
    <div 
      key={node.id}
      onClick={() => onSelectNode(node.id)}
      className={`
        group flex items-center justify-between px-3 py-2 mx-2 rounded-lg cursor-pointer text-xs transition-all mb-0.5
        ${activeNodeId === node.id 
          ? 'bg-white dark:bg-graphite-850 shadow-sm text-blue-600 dark:text-zinc-200 font-bold border border-slate-100 dark:border-white/5' 
          : 'text-slate-600 dark:text-zinc-500 hover:bg-slate-200/50 dark:hover:bg-graphite-850 hover:text-slate-950 dark:hover:text-zinc-300 border border-transparent'}
      `}
    >
      <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
        <div className={`shrink-0 ${activeNodeId === node.id ? 'opacity-100' : 'opacity-60'}`}>
          <NodeIcon type={node.type} />
        </div>
        <span className="truncate tracking-tight">{node.title || 'Untitled'}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-600 hover:text-red-500 transition-all"
        >
          <Trash2 size={12} />
        </button>
        {activeNodeId === node.id && <ChevronRight size={12} className="text-blue-500" />}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full select-none bg-slate-50 dark:bg-graphite-950 transition-colors border-r border-slate-200 dark:border-graphite-900">
      <div className="p-4 border-b border-slate-200 dark:border-graphite-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 font-black text-slate-800 dark:text-zinc-200 text-[10px] uppercase tracking-[0.2em]">
          <div className="w-5 h-5 bg-slate-900 dark:bg-graphite-800 rounded-md flex items-center justify-center text-white">
            <BookIcon size={10} />
          </div>
          <span>Manuscript</span>
        </div>
        <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-zinc-200 p-1.5"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {['Front Matter', 'Body', 'Back Matter'].map((cat) => {
          const catNodes = groupedNodes[cat as keyof typeof groupedNodes];
          if (catNodes.length === 0) return null;
          return (
            <React.Fragment key={cat}>
              <SectionHeader title={cat} count={catNodes.length} />
              {catNodes.map(renderNode)}
            </React.Fragment>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-graphite-900 shrink-0">
        <button 
          onClick={onAddNode}
          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-graphite-800 text-white rounded-xl shadow-md text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-graphite-700 transition-all active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          <span>Add Segment</span>
        </button>
      </div>
    </div>
  );
};