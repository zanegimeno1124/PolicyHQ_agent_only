import React from 'react';
import { Zap, Trophy, Building2, TrendingUp, Star, Share2, History } from 'lucide-react';
import { ArenaEntry, SaleRecord } from '../services/agentleaderboardRealtimeApi';

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

const MT_SHIFT = 2 * 60 * 60 * 1000;

export const AgentComparisonView: React.FC<{
  agents: ArenaEntry[];
  isNightMode: boolean;
  onClear: () => void;
  onRemoveAgent: (id: string) => void;
  todayData: ArenaEntry[];
  mtdData: ArenaEntry[];
  arenaFeed: SaleRecord[];
}> = ({ agents, isNightMode, onClear, onRemoveAgent, todayData, mtdData, arenaFeed }) => {
  const maxPremium = Math.max(...agents.map(a => a.total_annualPremium), 1);

  return (
    <div className={`rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col h-full transition-all border ${
      isNightMode ? 'bg-slate-900/60 border-white/5 backdrop-blur-3xl' : 'bg-white border-slate-100'
    }`}>
      <div className={`p-6 flex items-center justify-between shrink-0 border-b ${
        isNightMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50/30 border-slate-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isNightMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className={`text-base font-black tracking-tight ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
            Head-to-Head Comparison
          </h3>
        </div>
        <button
          onClick={onClear}
          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
            isNightMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          Clear Comparison
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide p-6">
        <div className="flex gap-6 h-full min-w-max">
          {agents.map(agent => {
            const today = todayData.find(e => e.agent_id === agent.agent_id);
            const mtd = mtdData.find(e => e.agent_id === agent.agent_id);
            const feed = arenaFeed.filter(e => e.agentId === agent.agent_id);
            const sources = [...new Set(feed.map(s => s.sourceName).filter(Boolean))];

            return (
              <div key={agent.agent_id} className={`w-80 shrink-0 flex flex-col rounded-[2rem] border overflow-hidden transition-all ${
                isNightMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>

                {/* HEADER */}
                <div className="p-6 pb-5 text-center relative bg-slate-950 overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  <button
                    onClick={() => onRemoveAgent(agent.agent_id)}
                    className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-[1.5rem] border-4 border-slate-800 shadow-xl mb-3 overflow-hidden flex items-center justify-center bg-slate-900 ring-4 ring-brand-500/20">
                      {agent.agent_profile?.url ? (
                        <img src={agent.agent_profile.url} className="w-full h-full object-cover" alt={agent.agent_name} />
                      ) : (
                        <span className="text-2xl font-black text-slate-400">{getInitials(agent.agent_name)}</span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white tracking-tight truncate px-2 mb-1">{agent.agent_name}</h4>
                    <div className="flex items-center justify-center gap-1.5 opacity-60">
                      <Building2 className="w-3 h-3 text-slate-300" />
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] truncate max-w-[160px]">{agent.agency || 'Organization'}</span>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className={`flex-1 overflow-y-auto scrollbar-hide p-5 space-y-5 ${isNightMode ? 'bg-white/[0.02]' : 'bg-white'}`}>

                  {/* Production volume bar */}
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Production Volume</p>
                    <span className={`text-2xl font-black tracking-tighter leading-none block mb-2 ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatCurrency(agent.total_annualPremium)}
                    </span>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isNightMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(agent.total_annualPremium / maxPremium) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Today + MTD */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-2xl border space-y-2 ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-brand-500 fill-brand-500" />
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Today</p>
                      </div>
                      <p className={`text-sm font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(today?.total_annualPremium || 0)}</p>
                      <p className={`text-[9px] font-bold ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>{today?.records || 0} apps</p>
                    </div>
                    <div className={`p-3 rounded-2xl border space-y-2 ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3 h-3 text-indigo-500" />
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>MTD</p>
                      </div>
                      <p className={`text-sm font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(mtd?.total_annualPremium || 0)}</p>
                      <p className={`text-[9px] font-bold ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>{mtd?.records || 0} apps</p>
                    </div>
                  </div>

                  {/* Apps + Avg */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Apps Written</p>
                      <p className={`text-xl font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{agent.records}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Avg Premium</p>
                      <p className={`text-xl font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(agent.total_annualPremium / (agent.records || 1))}</p>
                    </div>
                  </div>

                  {/* Lead Sources */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="w-3 h-3 text-indigo-400" />
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Recent Lead Sources</p>
                    </div>
                    {sources.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {sources.map(src => (
                          <span key={src} className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                            isNightMode ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>{src}</span>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-[9px] font-bold ${isNightMode ? 'text-slate-600' : 'text-slate-300'}`}>No source data</p>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-brand-500 fill-brand-500" />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Recent Activity</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isNightMode ? 'text-slate-600' : 'text-slate-300'}`}>{feed.length} entries</span>
                    </div>
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                      {feed.length > 0 ? feed.map(sale => (
                        <div key={sale.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isNightMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-white/5">
                              <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[10px] font-black uppercase tracking-tighter truncate leading-none mb-0.5 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{sale.policyCarrier}</p>
                              <p className={`text-[8px] font-bold uppercase opacity-50 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {new Date(sale.created_at - MT_SHIFT).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Denver' })}
                              </p>
                            </div>
                          </div>
                          <p className="text-[11px] font-black text-emerald-500 tracking-tighter ml-2 shrink-0">{formatCurrency(sale.annual_premium)}</p>
                        </div>
                      )) : (
                        <div className={`py-6 text-center rounded-2xl border-2 border-dashed ${
                          isNightMode ? 'text-slate-700 border-white/5' : 'text-slate-300 border-slate-100'
                        }`}>
                          <History className="w-5 h-5 mx-auto mb-1 opacity-20" />
                          <p className="text-[8px] font-black uppercase tracking-widest">No Recent Sales</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
