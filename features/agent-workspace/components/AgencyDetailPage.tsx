import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Crown,
  Users,
  GitBranch,
  TrendingUp,
  Loader2,
  Trophy,
  Activity,
  Zap,
  ArrowRight,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { agentOverviewApi, TeamRankingEntry } from '../services/agentOverviewApi';
import { agentleaderboardRealtimeApi, ArenaEntry, SaleRecord } from '../services/agentleaderboardRealtimeApi';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD',
  }).format(val || 0);

const fmtFull = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

function getBreakout(entry: TeamRankingEntry): number {
  return entry.breakout_premium ?? 0;
}

// ─── sub-components ─────────────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: string | number; accent?: string }> = ({
  label, value, accent = 'text-slate-900'
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className={`text-base font-black tracking-tighter ${accent}`}>{value}</span>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

const AgentRow: React.FC<{
  entry: ArenaEntry;
  index: number;
  max: number;
}> = ({ entry, index, max }) => {
  const pct = max > 0 ? (entry.total_annualPremium / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border ${
        index === 0 ? 'bg-slate-900 text-brand-500 border-slate-900' :
        index === 1 ? 'bg-slate-400 text-white border-slate-500' :
        index === 2 ? 'bg-orange-500 text-white border-orange-600' :
        'bg-white text-slate-400 border-slate-200'
      }`}>
        {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
      </div>
      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
        {entry.agent_profile?.url
          ? <img src={entry.agent_profile.url} className="w-full h-full object-cover" alt={entry.agent_name} />
          : <span className="text-[9px] font-black text-slate-500">{getInitials(entry.agent_name)}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-slate-800 truncate leading-tight">{entry.agent_name}</p>
        <div className="w-full h-1 rounded-full bg-slate-100 mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${index === 0 ? 'bg-brand-500' : 'bg-slate-300'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-slate-900 tracking-tighter">{fmt(entry.total_annualPremium)}</p>
        <p className="text-[9px] text-slate-400 font-bold">{entry.records} apps</p>
      </div>
    </div>
  );
};

// ─── main page ──────────────────────────────────────────────────────────────

export const AgencyDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateTeam = (location.state as { team?: TeamRankingEntry; allTeams?: TeamRankingEntry[] } | null)?.team;
  const stateAllTeams = (location.state as { team?: TeamRankingEntry; allTeams?: TeamRankingEntry[] } | null)?.allTeams;

  // Team data — pre-populated from nav state for instant render
  const [team, setTeam] = useState<TeamRankingEntry | null>(stateTeam ?? null);
  const [allTeams, setAllTeams] = useState<TeamRankingEntry[]>(stateAllTeams ?? []);
  const [teamLoading, setTeamLoading] = useState(!stateTeam);

  // Realtime data
  const [todayData, setTodayData] = useState<ArenaEntry[]>([]);
  const [mtdData, setMtdData] = useState<ArenaEntry[]>([]);
  const [todaySummary, setTodaySummary] = useState({ total_premium: 0, total_records: 0 });
  const [mtdSummary, setMtdSummary] = useState({ total_premium: 0, total_records: 0 });
  const [feed, setFeed] = useState<SaleRecord[]>([]);
  const [realtimeLoading, setRealtimeLoading] = useState(true);
  const [lastSync, setLastSync] = useState('Loading…');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch team data only when not available from navigation state (direct URL / bookmark access)
  useEffect(() => {
    if (!teamId || (stateTeam && stateAllTeams?.length)) return;
    agentOverviewApi.getTeamRanking(null, null)
      .then(data => {
        setAllTeams(data);
        if (!stateTeam) setTeam(data.find(t => t.id === teamId) ?? null);
      })
      .catch(console.error)
      .finally(() => setTeamLoading(false));
  }, [teamId]);

  // Load realtime data for this team
  const refreshRealtime = useCallback(async (initial = false) => {
    if (!teamId) return;
    if (initial) setRealtimeLoading(true);
    setRefreshing(true);
    try {
      const [todayRes, mtdRes, feedRes] = await Promise.all([
        agentleaderboardRealtimeApi.getRealtimeLeaderboard(null, undefined, teamId),
        agentleaderboardRealtimeApi.getMTDLeaderboard(undefined, teamId),
        agentleaderboardRealtimeApi.getArenaFeed(undefined, teamId),
      ]);
      setTodayData(todayRes.today_rundown || []);
      setTodaySummary(todayRes.applications || { total_premium: 0, total_records: 0 });
      setMtdData(mtdRes.mtd_rundown || []);
      setMtdSummary(mtdRes.applications || { total_premium: 0, total_records: 0 });
      setFeed(feedRes || []);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setRealtimeLoading(false);
      setRefreshing(false);
    }
  }, [teamId]);

  useEffect(() => { refreshRealtime(true); }, [refreshRealtime]);

  // Auto-refresh every 90 seconds
  useEffect(() => {
    const id = setInterval(() => refreshRealtime(), 90_000);
    return () => clearInterval(id);
  }, [refreshRealtime]);

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
        <Building2 className="w-16 h-16 opacity-20" />
        <p className="text-sm font-black uppercase tracking-widest">Agency not found</p>
        <button onClick={() => navigate('/')} className="text-xs font-bold text-brand-500 hover:underline">← Back</button>
      </div>
    );
  }

  const breakout = getBreakout(team);
  const impact = team.total_premium + breakout;

  // Resolve direct legs with full team data for premium display
  const directLegs = (team.direct_leg || []).map(leg => {
    const match = allTeams.find(t => t.id === leg.id);
    return { ...leg, total_premium: match?.total_premium ?? 0, logo: match?.logo ?? null };
  }).sort((a, b) => b.total_premium - a.total_premium);

  const maxToday = todayData.length > 0 ? todayData[0].total_annualPremium : 1;
  const maxMtd = mtdData.length > 0 ? mtdData[0].total_annualPremium : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Back bar ────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-bold">Back</span>
      </button>

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
            {team.logo?.url
              ? <img src={team.logo.url} className="w-full h-full object-contain p-2" alt={team.name} />
              : <span className="text-white font-black text-xl">{getInitials(team.name)}</span>}
          </div>

          {/* Name + manager */}
          <div className="flex-1">
            <p className="text-[10px] font-black text-indigo-300/50 uppercase tracking-[0.3em] mb-1">Agency Profile</p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-1">{team.name}</h1>
            <p className="text-sm font-bold text-indigo-200/50">Manager: <span className="text-indigo-200/80">{team.manager}</span></p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 bg-white/5 rounded-2xl px-6 py-4 border border-white/10 shrink-0">
            <StatPill label="Agents" value={team.agents} accent="text-white" />
            <div className="w-px h-8 bg-white/10" />
            <StatPill label="Apps" value={team.submissions} accent="text-white" />
            <div className="w-px h-8 bg-white/10" />
            <StatPill label="Issued" value={team.issued} accent="text-white" />
          </div>
        </div>

        {/* ── Premium metrics row ────────────────────────────────────── */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Team Premium</span>
            </div>
            <span className="text-2xl font-black text-brand-400 tracking-tighter">{fmt(team.total_premium)}</span>
            <span className="text-[9px] text-white/30 font-bold">{fmtFull(team.total_premium)}</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-white/10 px-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Breakout Premium</span>
            </div>
            <span className="text-2xl font-black text-indigo-400 tracking-tighter">{fmt(breakout)}</span>
            <span className="text-[9px] text-white/30 font-bold">Child Teams AP</span>
          </div>
          <div className="flex flex-col gap-1 pl-4">
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Leadership Impact</span>
            </div>
            <span className="text-2xl font-black text-emerald-400 tracking-tighter">{fmt(impact)}</span>
            <span className="text-[9px] text-white/30 font-bold">Team + Breakout</span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Hierarchy ───────────────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <GitBranch className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Hierarchy Structure</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Sub-Agencies</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 rounded-full px-3 py-1 border border-indigo-100">
              {directLegs.length} sub-{directLegs.length === 1 ? 'agency' : 'agencies'}
            </span>
          </div>

          <div className="p-6 space-y-2">
            {/* Parent node */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                {team.logo?.url
                  ? <img src={team.logo.url} className="w-full h-full object-contain p-1.5" alt={team.name} />
                  : <span className="text-white font-black text-[9px]">{getInitials(team.name)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-indigo-900 truncate">{team.name}</p>
                <p className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-wider">This Agency · {fmt(team.total_premium)}</p>
              </div>
              <Crown className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>

            {directLegs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <GitBranch className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No sub-agencies</p>
              </div>
            ) : (
              <div className="pl-4 space-y-1.5 border-l-2 border-dashed border-slate-200 ml-4">
                {directLegs.map((leg, i) => (
                  <button
                    key={leg.id}
                    onClick={() => navigate(`/agency/${leg.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-indigo-200">
                      {leg.logo?.url
                        ? <img src={leg.logo.url} className="w-full h-full object-contain p-1" alt={leg.name} />
                        : <span className="text-[9px] font-black text-slate-500">{getInitials(leg.name)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{leg.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {fmt(leg.total_premium)}
                        </span>
                        {i === 0 && (
                          <span className="text-[8px] font-black text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5 border border-amber-100">TOP</span>
                        )}
                      </div>
                    </div>
                    {/* Breakout share bar */}
                    {breakout > 0 && (
                      <div className="w-16 shrink-0">
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                            style={{ width: `${Math.min((leg.total_premium / breakout) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5 text-right">
                          {breakout > 0 ? `${Math.round((leg.total_premium / breakout) * 100)}%` : '—'}
                        </p>
                      </div>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Live Arena ─────────────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Live Arena</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today · MTD Production</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {lastSync}
              </div>
              <button
                onClick={() => refreshRealtime()}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* MTD / Today summary pills */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-50 shrink-0">
            <div className="px-6 py-4 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Activity className="w-3 h-3 text-brand-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today</span>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{fmt(todaySummary.total_premium)}</span>
              <span className="text-[9px] font-bold text-slate-400">{todaySummary.total_records} apps</span>
            </div>
            <div className="px-6 py-4 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3 h-3 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Month to Date</span>
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{fmt(mtdSummary.total_premium)}</span>
              <span className="text-[9px] font-bold text-slate-400">{mtdSummary.total_records} apps</span>
            </div>
          </div>

          {/* Agent leaderboard tabs */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {realtimeLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Arena…</p>
              </div>
            ) : (
              <div>
                {/* Today leaderboard */}
                {todayData.length > 0 && (
                  <div className="px-4 py-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-2">
                      Today's Top Producers
                    </p>
                    {todayData.slice(0, 10).map((entry, i) => (
                      <AgentRow key={entry.agent_id} entry={entry} index={i} max={maxToday} />
                    ))}
                  </div>
                )}

                {/* MTD leaderboard */}
                {mtdData.length > 0 && (
                  <div className="px-4 py-4 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-2">
                      Month-to-Date Leaders
                    </p>
                    {mtdData.slice(0, 10).map((entry, i) => (
                      <AgentRow key={entry.agent_id} entry={entry} index={i} max={maxMtd} />
                    ))}
                  </div>
                )}

                {todayData.length === 0 && mtdData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                    <Trophy className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">No activity yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent sales feed footer */}
          {feed.length > 0 && (
            <div className="border-t border-slate-50 px-6 py-4 bg-slate-50/40 shrink-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Recent Sales</p>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {feed.slice(0, 8).map(sale => (
                  <div key={sale.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-[10px] font-bold text-slate-600 truncate">{sale.agentOwner_name}</p>
                      <span className="text-[9px] text-slate-400 truncate shrink-0">{sale.policyCarrier}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 shrink-0">{fmt(sale.annual_premium)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
