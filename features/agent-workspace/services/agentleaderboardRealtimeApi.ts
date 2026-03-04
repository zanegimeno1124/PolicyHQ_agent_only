import { BASE_URL, ApiError } from '../../../services/api';

const getAuthToken = () => localStorage.getItem('authToken');

const authHeader = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

export interface ArenaEntry {
  agent_id: string;
  agent_name: string;
  agency: string;
  total_annualPremium: number;
  records: number;
  agent_profile?: {
    url?: string;
    access?: string;
    path?: string;
    name?: string;
    type?: string;
    size?: number;
    mime?: string;
    meta?: any;
  } | null;
}

export interface MTDLeaderboardResponse {
  mtd_rundown: ArenaEntry[];
  applications: {
    total_premium: number;
    total_records: number;
  };
}

export interface TodayLeaderboardResponse {
  today_rundown: ArenaEntry[];
  applications: {
    total_premium: number;
    total_records: number;
  };
}

export interface WeekYearResponse {
  week_application: {
    total_premium: number;
    total_records: number;
  };
  year_application: {
    total_premium: number;
    total_records: number;
  };
}

export interface SaleRecord {
  id: string;
  created_at: number;
  annual_premium: number;
  agentOwner_name: string;
  agentId: string;
  teamName: string;
  teamId: string;
  sourceName: string;
  policyStatus: string;
  policyCarrier: string;
}

export const agentleaderboardRealtimeApi = {
  /**
   * Fetches production rankings for Today
   */
  getRealtimeLeaderboard: async (agencyId: string | null = null, sourceId?: string): Promise<TodayLeaderboardResponse> => {
    const params = new URLSearchParams();
    if (agencyId) params.append('agency_id', agencyId);
    
    let url = `${BASE_URL}/arena/today`;
    if (sourceId) {
      url = `${BASE_URL}/arena/today/${sourceId}`;
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeader(),
    });

    if (!response.ok) throw new ApiError('Failed to fetch today standings', response.status);
    return response.json();
  },

  /**
   * Fetches production rankings for Month to Date (MTD)
   */
  getMTDLeaderboard: async (sourceId?: string): Promise<MTDLeaderboardResponse> => {
    let url = `${BASE_URL}/arena/mtd`;
    if (sourceId) {
      url = `${BASE_URL}/arena/mtd/${sourceId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeader(),
    });

    if (!response.ok) throw new ApiError('Failed to fetch MTD arena data', response.status);
    return response.json();
  },

  /**
   * Fetches aggregated stats for the current week and year
   */
  getWeekYearStats: async (sourceId?: string): Promise<WeekYearResponse> => {
    let url = `${BASE_URL}/arena/week_year`;
    if (sourceId) {
      url = `${BASE_URL}/arena/week_year/${sourceId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeader(),
    });

    if (!response.ok) throw new ApiError('Failed to fetch weekly and yearly stats', response.status);
    return response.json();
  },

  /**
   * Fetches the recent sales feed for the arena
   */
  getArenaFeed: async (sourceId?: string): Promise<SaleRecord[]> => {
    let url = `${BASE_URL}/arena/feed`;
    if (sourceId) {
      url = `${BASE_URL}/arena/feed/${sourceId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeader(),
    });

    if (!response.ok) throw new ApiError('Failed to fetch arena feed', response.status);
    return response.json();
  }
};
