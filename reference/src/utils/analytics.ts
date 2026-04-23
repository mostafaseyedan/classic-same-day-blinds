interface PageView {
  path: string;
  timestamp: number;
  sessionId: string;
}

interface AnalyticsData {
  pageViews: PageView[];
  sessions: string[];
}

const STORAGE_KEY = 'site_analytics';
const SESSION_KEY = 'analytics_session_id';

// Generate or retrieve session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Track page view
export const trackPageView = (path: string): void => {
  const sessionId = getSessionId();
  const data = getAnalyticsData();
  
  const pageView: PageView = {
    path,
    timestamp: Date.now(),
    sessionId,
  };
  
  data.pageViews.push(pageView);
  
  // Keep only last 1000 page views to prevent storage overflow
  if (data.pageViews.length > 1000) {
    data.pageViews = data.pageViews.slice(-1000);
  }
  
  // Track unique sessions
  if (!data.sessions.includes(sessionId)) {
    data.sessions.push(sessionId);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get analytics data
export const getAnalyticsData = (): AnalyticsData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { pageViews: [], sessions: [] };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return { pageViews: [], sessions: [] };
  }
};

// Get total page views
export const getTotalPageViews = (): number => {
  const data = getAnalyticsData();
  return data.pageViews.length;
};

// Get most visited pages
export const getMostVisitedPages = (): { path: string; count: number }[] => {
  const data = getAnalyticsData();
  const pathCounts: Record<string, number> = {};
  
  data.pageViews.forEach((view) => {
    pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
  });
  
  return Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);
};

// Get visits by day (last 7 days)
export const getVisitsByDay = (): { date: string; count: number }[] => {
  const data = getAnalyticsData();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  const dayCounts: Record<string, number> = {};
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dayCounts[dateStr] = 0;
  }
  
  // Count views per day
  data.pageViews.forEach((view) => {
    if (view.timestamp >= sevenDaysAgo) {
      const date = new Date(view.timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dayCounts[dateStr] !== undefined) {
        dayCounts[dateStr]++;
      }
    }
  });
  
  return Object.entries(dayCounts).map(([date, count]) => ({ date, count }));
};

// Get recent page views
export const getRecentPageViews = (limit: number = 20): PageView[] => {
  const data = getAnalyticsData();
  return data.pageViews.slice(-limit).reverse();
};

// Get active sessions count (sessions active in last 30 minutes)
export const getActiveSessionsCount = (): number => {
  const data = getAnalyticsData();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  
  const activeSessions = new Set<string>();
  data.pageViews.forEach((view) => {
    if (view.timestamp >= thirtyMinutesAgo) {
      activeSessions.add(view.sessionId);
    }
  });
  
  return activeSessions.size;
};