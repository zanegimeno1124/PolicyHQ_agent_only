import React from 'react';
import { Zap, Trophy, BarChart3, Building2, TrendingUp } from 'lucide-react';
import { ArenaEntry } from '../services/agentleaderboardRealtimeApi';

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(val || 0);
};

export const AgentComparisonView: React.FC<{
  agents: ArenaEntry[];
  isNightMode: boolean;
  onClear: () => void;
  onRemoveAgent: (id: string) => void;
}> = ({ agents, isNightMode, onClear, onRemoveAgent }) => {
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
            {agents.map(agent => (
               <div key={agent.agent_id} className={`w-80 shrink-0 flex flex-col rounded-[2rem] border overflow-hidden transition-all ${
                 isNightMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
               }`}>
                  <div className="p-6 text-center relative overflow-hidden shrink-0">
                     <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] ${
                        isNightMode ? 'bg-brand-500/20' : 'bg-brand-500/10'
                     }`}></div>
                     <button 
                       onClick={() => onRemoveAgent(agent.agent_id)}
                       className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest ${
                         isNightMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                       }`}
                     >
                       Remove
                     </button>
                     
                     <div className={`w-20 h-20 mx-auto rounded-2xl border-4 shadow-lg mb-4 overflow-hidden flex items-center justify-center ${
                        isNightMode ? 'border-slate-800 bg-slate-900' : 'border-white bg-slate-100'
                     }`}>
                        {agent.agent_profile?.url ? (
                          <img src={agent.agent_profile.url} className="w-full h-full object-cover" alt={agent.agent_name} />
                        ) : (
                          <span className={`text-2xl font-black ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>{getInitials(agent.agent_name)}</span>
                        )}
                     </div>
                     <h4 className={`text-lg font-black tracking-tight truncate px-2 mb-1 ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{agent.agent_name}</h4>
                     <div className="flex items-center justify-center gap-1.5 opacity-60">
                        <Building2 className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{agent.agency || 'Organization'}</span>
                     </div>
                  </div>

                  <div className={`flex-1 p-6 space-y-6 ${isNightMode ? 'bg-white/[0.02]' : 'bg-white'}`}>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Production Volume</p>
                        <div className="flex items-end gap-2 mb-2">
                           <span className={`text-3xl font-black tracking-tighter leading-none ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                             {formatCurrency(agent.total_annualPremium)}
                           </span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${isNightMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                           <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(agent.total_annualPremium / maxPremium) * 100}%` }}></div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                           <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Apps Written</p>
                           <p className={`text-xl font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{agent.records}</p>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-900 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                           <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>Avg Premium</p>
                           <p className={`text-xl font-black ${isNightMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(agent.total_annualPremium / (agent.records || 1))}</p>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
