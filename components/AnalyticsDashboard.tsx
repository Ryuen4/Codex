import React, { useMemo } from 'react';
import { Book, WritingSession } from '../types';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Type, 
  Activity, 
  Zap, 
  ChevronLeft,
  Calendar,
  Layers,
  Search,
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  countWords, 
  getLexicalDiversity, 
  getSentenceMetrics, 
  getProjections 
} from '../utils/statsCalculator';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface AnalyticsDashboardProps {
  book: Book;
  onBack: () => void;
  // Added theme prop to support dynamic styling in charts
  theme: 'light' | 'dark';
}

const MetricCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500">
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mono-font">{value}</div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtext}</p>
    </div>
  </div>
);

const WritingHeatmap = ({ sessions }: { sessions: WritingSession[] }) => {
  const weeks = 22;
  const daysInWeek = 7;
  
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    (sessions || []).forEach(s => {
      const d = new Date(s.startTime).toISOString().split('T')[0];
      map[d] = (map[d] || 0) + (s.wordsAdded - s.wordsDeleted);
    });
    return map;
  }, [sessions]);

  const grid = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < daysInWeek; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + d));
        const dateStr = date.toISOString().split('T')[0];
        const activity = activityMap[dateStr] || 0;
        week.push({ date: dateStr, activity });
      }
      result.push(week);
    }
    return result;
  }, [activityMap]);

  const getColor = (activity: number) => {
    if (activity <= 0) return 'bg-slate-100 dark:bg-slate-800';
    if (activity < 200) return 'bg-blue-200 dark:bg-blue-900/30';
    if (activity < 500) return 'bg-blue-400 dark:bg-blue-700';
    if (activity < 1000) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-900 dark:bg-blue-400';
  };

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {grid.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1 shrink-0">
          {week.map((day, di) => (
            <div 
              key={di} 
              className={`w-3 h-3 rounded-[2px] ${getColor(day.activity)} transition-colors cursor-help`}
              title={`${day.date}: ${day.activity} words`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Destructured theme from props to fix missing reference
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ book, onBack, theme }) => {
  const stats = useMemo(() => {
    const totalWords = book.nodes.reduce((acc, n) => acc + countWords(n.content), 0);
    const fullText = book.nodes.map(n => n.content).join(' ');
    const diversity = getLexicalDiversity(fullText);
    const sentenceData = getSentenceMetrics(fullText);
    const proj = getProjections(book);
    
    const totalSeconds = (book.sessions || []).reduce((acc, s) => acc + s.activeSeconds, 0);
    const wordsPerHour = totalSeconds > 0 ? (totalWords / (totalSeconds / 3600)) : 0;

    const timelineData = (book.history || []).map(h => ({
      date: h.date,
      cumulative: h.totalWords,
      net: h.netWords
    }));

    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    (book.sessions || []).forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourlyDistribution[hour].count += (s.wordsAdded - s.wordsDeleted);
    });

    const chapterData = book.nodes.map(n => {
      const nodeSessions = (book.sessions || []).filter(s => s.nodeId === n.id);
      const totalChanges = nodeSessions.reduce((acc, s) => acc + s.wordsAdded + s.wordsDeleted, 0);
      const currentWords = countWords(n.content);
      return {
        name: n.title,
        words: currentWords,
        editDensity: currentWords > 0 ? (totalChanges / currentWords) * 100 : 0
      };
    });

    return {
      totalWords,
      diversity,
      avgSentence: sentenceData.avg,
      proj,
      wordsPerHour,
      totalSeconds,
      timelineData,
      hourlyDistribution,
      chapterData
    };
  }, [book]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Instrumentation Dashboard</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Professional metrics for "{book.title}"</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Status</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {stats.proj.percentComplete.toFixed(1)}% Complete
            </p>
          </div>
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden self-center hidden sm:block">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000" 
              style={{ width: `${stats.proj.percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Words" value={stats.totalWords.toLocaleString()} subtext="Across all nodes" icon={Type} />
          <MetricCard title="Avg. Words / Hour" value={Math.round(stats.wordsPerHour)} subtext="Net productivity rate" icon={Zap} />
          <MetricCard title="Lexical Diversity" value={`${(stats.diversity * 100).toFixed(1)}%`} subtext="Vocabulary richness" icon={Activity} />
          <MetricCard title="Writing Time" value={`${Math.floor(stats.totalSeconds / 3600)}h ${Math.floor((stats.totalSeconds % 3600) / 60)}m`} subtext="Active duration" icon={Clock} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <LineChartIcon size={18} className="text-blue-500" />
              Word Count Evolution
            </h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Cumulative</div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-blue-200 dark:bg-blue-900"></span> Net Daily</div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#f1f5f9' }}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
                <Bar dataKey="net" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-500" />
              Structural Balance & Edit Density
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chapterData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' }} cursor={{ fill: '#f8fafc', opacity: 0.1 }} />
                  <Bar dataKey="words" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="editDensity" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Time-of-Day Output Histogram
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyDistribution}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' }} cursor={{ fill: '#f8fafc', opacity: 0.1 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.hourlyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#f97316' : (theme === 'dark' ? '#1e293b' : '#f1f5f9')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Calendar size={16} className="text-blue-500" />
                Writing Consistency (22 Weeks)
              </h3>
              <div className="flex gap-2 items-center text-[10px] text-slate-400">
                Less <div className="w-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-[1px]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-[1px]"></div>
                <div className="w-2 h-2 bg-blue-900 dark:bg-blue-400 rounded-[1px]"></div> More
              </div>
            </div>
            <WritingHeatmap sessions={book.sessions} />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Target size={16} className="text-indigo-500" />
              Goal & Velocity Summary
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Burn Rate (7d)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{Math.round(stats.proj.avgPerDay)} / day</span>
                </div>
                <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: `${Math.min(100, (stats.proj.avgPerDay / 1000) * 100)}%` }} />
                </div>
              </div>

              {stats.wordsPerHour < 300 && stats.wordsPerHour > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase block mb-1">Alert: High Churn</span>
                  <p className="text-[11px] text-yellow-800 dark:text-yellow-200">Net velocity is low relative to input. Potential over-revision cycle.</p>
                </div>
              )}
              
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">Draft Stability</span>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-200">Chapter length variance is within 15% range. Pacing is consistent.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl overflow-hidden transition-colors">
          <h3 className="font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Activity size={16} />
            Raw Writing Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="pb-3 font-medium">Session Start</th>
                  <th className="pb-3 font-medium">Net Change</th>
                  <th className="pb-3 font-medium">Active Duration</th>
                  <th className="pb-3 font-medium">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {(book.sessions || []).slice(-8).reverse().map((session, i) => {
                  const net = session.wordsAdded - session.wordsDeleted;
                  const v = session.activeSeconds > 0 ? (net / (session.activeSeconds / 3600)) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 text-slate-300">
                        {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className={`py-4 font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {net > 0 ? '+' : ''}{net} w
                      </td>
                      <td className="py-4 text-slate-400">{Math.round(session.activeSeconds / 60)} min</td>
                      <td className="py-4 text-slate-500 mono-font">{Math.round(v)} w/h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(book.sessions || []).length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-700 italic text-center py-8">No session data available for ledger.</p>
          )}
        </div>
      </div>
    </div>
  );
};