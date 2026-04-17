import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Phone,
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  PhoneIncoming,
  CheckCircle,
  Clock,
  Crown,
  Medal,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  agentLeaderboardPolicytekApi,
  PolicytekCallEntry,
  getCurrentWeekStart,
  toDateStr,
} from '../services/agentLeaderboardPolicytekApi';

// ── Date Range Picker ─────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const fmtDisplay = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
};

const fmtShort = (dateStr: string): string => {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
};

const dateStrFromParts = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const DateRangePicker: React.FC<{
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}> = ({ startDate, endDate, onChange }) => {
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(() => parseInt(startDate.split('-')[0]));
  const [viewMonth, setViewMonth] = useState(() => parseInt(startDate.split('-')[1]) - 1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = toDateStr(new Date());

  const handleDayClick = (d: string) => {
    if (selecting === 'start' || d < tempStart) {
      setTempStart(d); setTempEnd(d); setSelecting('end');
    } else {
      setTempEnd(d); setSelecting('start');
    }
  };

  const effectiveEnd = selecting === 'end' && hoverDate && hoverDate >= tempStart ? hoverDate : tempEnd;
  const inRange = (d: string) => d > tempStart && d < effectiveEnd;

  const applyPreset = (s: string, e: string) => {
    setTempStart(s); setTempEnd(e); setSelecting('start');
    const [y, m] = s.split('-').map(Number);
    setViewYear(y); setViewMonth(m - 1);
  };

  const now = new Date();
  const wkStart = toDateStr(getCurrentWeekStart());
  const wkEnd = (() => { const d = new Date(getCurrentWeekStart()); d.setDate(d.getDate() + 6); return toDateStr(d); })();
  const mtdStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const ytdStart = `${now.getFullYear()}-01-01`;

  const presets = [
    { label: 'This Week', s: wkStart, e: wkEnd },
    { label: 'MTD', s: mtdStart, e: todayStr },
    { label: 'YTD', s: ytdStart, e: todayStr },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Trigger pill */}
      <button
        onClick={() => { setTempStart(startDate); setTempEnd(endDate); setSelecting('start'); setOpen(o => !o); }}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-brand-300 hover:shadow-md transition-all group"
      >
        <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span className="text-slate-900">{fmtShort(startDate)}</span>
        <span className="text-slate-300 font-normal">–</span>
        <span className="text-slate-900">{fmtShort(endDate)}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-5 w-72">
          {/* Presets */}
          <div className="flex gap-1.5 mb-4">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.s, p.e)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  tempStart === p.s && tempEnd === p.e
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <span className="text-sm font-black text-slate-900">{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 py-0.5">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = dateStrFromParts(viewYear, viewMonth, day);
              const isStart = d === tempStart;
              const isEnd = d === tempEnd || (selecting === 'end' && hoverDate === d && d >= tempStart);
              const inR = inRange(d);
              const isToday = d === todayStr;
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(d)}
                  onMouseEnter={() => { if (selecting === 'end') setHoverDate(d); }}
                  onMouseLeave={() => setHoverDate(null)}
                  className={[
                    'h-8 w-full text-xs font-bold transition-all',
                    isStart || isEnd ? 'bg-slate-900 text-white rounded-xl shadow-md shadow-slate-900/20 z-10 relative' : '',
                    inR && !isStart && !isEnd ? 'bg-brand-500/10 text-brand-700' : '',
                    !isStart && !isEnd && !inR ? 'text-slate-600 hover:bg-slate-100 rounded-xl' : '',
                    isToday && !isStart && !isEnd ? 'ring-1 ring-inset ring-brand-400 rounded-xl' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 truncate">
              {fmtDisplay(tempStart)} – {fmtDisplay(tempEnd)}
            </span>
            <button
              onClick={() => { onChange(tempStart, tempEnd); setOpen(false); }}
              className="shrink-0 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const s = Math.round(seconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':');
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
        <Crown className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shadow-lg shadow-orange-400/30">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
      <span className="text-xs font-black text-slate-500">{rank}</span>
    </div>
  );
};

const getDefaultDates = () => {
  const fri = getCurrentWeekStart();
  const thu = new Date(fri);
  thu.setDate(fri.getDate() + 6);
  return { start: toDateStr(fri), end: toDateStr(thu) };
};

export const AgentLeaderboardPolicytek: React.FC = () => {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [entries, setEntries] = useState<PolicytekCallEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (s = startDate, e = endDate) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await agentLeaderboardPolicytekApi.getCallReport(s, e);
      const sorted = [...data].sort((a, b) => (b.valid_calls ?? 0) - (a.valid_calls ?? 0));
      setEntries(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load call report');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load once on mount with defaults
  useEffect(() => { load(startDate, endDate); }, []);  // eslint-disable-line

  const handleDateChange = (s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
    load(s, e);
  };

  const totalCalls = entries.reduce((s, e) => s + (e.calls_received ?? 0), 0);
  const totalValid = entries.reduce((s, e) => s + (e.valid_calls ?? 0), 0);
  const totalDuration = entries.reduce((s, e) => s + (e.total_duration ?? 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Phone className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Call Report</h1>
            <p className="text-xs text-slate-400 font-medium">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading data...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
          <button
            onClick={() => load(startDate, endDate)}
            disabled={isLoading}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-500 hover:border-brand-200 transition-all hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <PhoneIncoming className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calls Received</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{totalCalls.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valid Calls</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">{totalValid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Talk Time</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{formatDuration(totalDuration)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-bold text-slate-900">
              Rankings — {startDate} to {endDate}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{entries.length} agents</span>
        </div>

        {!isLoading && !error && entries.length > 0 && (
          <div className="px-6 py-2 grid grid-cols-[2rem_1fr_5rem_5rem_6rem_6rem] gap-4 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-50">
            <span>#</span>
            <span>Agent</span>
            <span className="text-right">Received</span>
            <span className="text-right">Valid</span>
            <span className="text-right">Talk Time</span>
            <span className="text-right">Avg / Call</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading call report...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm font-bold text-slate-700">Unable to load data</p>
            <p className="text-xs text-slate-400 max-w-xs text-center">{error}</p>
            <button
              onClick={load}
              className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">No data for this period</p>
          </div>
        )}

        {!isLoading && !error && entries.length > 0 && (
          <div className="divide-y divide-slate-50">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const barWidth =
                entries[0]?.valid_calls > 0
                  ? Math.round((entry.valid_calls / entries[0].valid_calls) * 100)
                  : 0;
              return (
                <div
                  key={entry.id}
                  className={`px-6 py-4 grid grid-cols-[2rem_1fr_5rem_5rem_6rem_6rem] gap-4 items-center transition-colors hover:bg-slate-50/50 ${
                    rank <= 3 ? 'bg-gradient-to-r from-slate-50/50 to-transparent' : ''
                  }`}
                >
                  <RankBadge rank={rank} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate capitalize">{entry.name}</p>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-orange-400' : 'bg-brand-400'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 text-right">{entry.calls_received ?? 0}</p>
                  <p className="text-sm font-black text-slate-900 text-right">{entry.valid_calls ?? 0}</p>
                  <p className="text-xs font-mono font-bold text-slate-700 text-right">{formatDuration(entry.total_duration)}</p>
                  <p className="text-xs font-mono text-slate-400 text-right">{formatDuration(entry.averageMin_perCall)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLeaderboardPolicytek;
