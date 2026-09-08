/**
 * API Client for SAHAKAR Backend
 * Centralizes all API calls and auth token management
 * 
 * ARCHITECTURE:
 * Raw Backend Response → This Layer → API Adapters → Frontend Components
 */

// CRITICAL: Backend runs on port 3000, not 4000
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_BASE = API_BASE_URL;

// ─── Auth Token Management ───────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('sahakar_token');
}

export function setToken(token: string): void {
  localStorage.setItem('sahakar_token', token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('sahakar_refresh_token');
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('sahakar_refresh_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('sahakar_token');
  localStorage.removeItem('sahakar_refresh_token');
  localStorage.removeItem('sahakar_user');
  localStorage.removeItem('demo_worker_id');
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem('sahakar_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
  localStorage.setItem('sahakar_user', JSON.stringify(user));
}

/**
 * Safe token diagnostics — NEVER logs the full token value.
 * Safe to call during development; produces a single console.warn line.
 */
export function logTokenDiagnostics(label = 'token check'): void {
  const token = getToken();
  const refreshToken = getRefreshToken();
  const user = getStoredUser();

  if (!token) {
    console.warn(`[auth:${label}] access_token: MISSING`);
    return;
  }

  // Decode the JWT payload locally (no verification, just inspection)
  let expiry: number | null = null;
  let userId: string | null = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      expiry = payload.exp ?? null;
      userId = payload.sub ?? null;
    }
  } catch {
    // Not a standard JWT (e.g. demo-token-*) — that's fine
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenLength = token.length;
  const isDemo = token.startsWith('demo-token-');
  const isExpired = expiry !== null && expiry < now;
  const expiresInSec = expiry !== null ? expiry - now : null;

  console.warn(
    `[auth:${label}]`,
    `token_present=true`,
    `length=${tokenLength}`,
    `is_demo=${isDemo}`,
    isDemo ? '' : `user_id=${userId ?? 'unknown'}`,
    expiry !== null
      ? `expires_in=${expiresInSec}s (${isExpired ? 'EXPIRED' : 'valid'})`
      : 'expiry=unknown',
    `refresh_token_present=${!!refreshToken}`,
    `stored_role=${user?.role ?? 'none'}`,
  );
}

// ─── Error Types ─────────────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status: number;
}

export class ApiException extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }

  is(code: string): boolean {
    return this.code === code;
  }

  isAuthError(): boolean {
    return this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN' || this.status === 401 || this.status === 403;
  }

  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.status === 400;
  }

  isNetworkError(): boolean {
    return this.code === 'SERVER_UNAVAILABLE' || this.code === 'NETWORK_ERROR' || this.status === 0;
  }

  isNotFoundError(): boolean {
    return this.code === 'NOT_FOUND' || this.status === 404;
  }
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

// Guards against concurrent refresh attempts
let _refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts a silent token refresh using the stored refresh_token.
 * Returns true if a new access_token was obtained, false otherwise.
 * Demo tokens (demo-token-*) are never refreshed via this path.
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  // Demo tokens don't expire — nothing to refresh
  const currentToken = getToken();
  if (currentToken?.startsWith('demo-token-')) return false;

  if (!refreshToken) return false;

  // Deduplicate concurrent refresh calls
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const body = await res.json();
      const newAccess = body?.data?.session?.access_token;
      const newRefresh = body?.data?.session?.refresh_token;

      if (!newAccess) return false;

      setToken(newAccess);
      if (newRefresh) setRefreshToken(newRefresh);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Let the browser set the multipart boundary for file uploads.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiException(
        'SERVER_UNAVAILABLE',
        'Unable to connect to server. Please check your connection.',
        0
      );
    }
    throw error;
  }

  // ── 401 handling: try silent refresh once, then give up cleanly ──
  if (res.status === 401 && !_isRetry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request with the new token
      return request<T>(endpoint, options, true);
    }
    // Refresh failed or not possible — clear stale credentials so the
    // AuthContext's isAuthenticated check returns false on next render.
    clearToken();
    throw new ApiException(
      'UNAUTHORIZED',
      'Your session has expired. Please log in again.',
      401
    );
  }

  // Handle network errors or empty responses
  let data: any;
  try {
    data = await res.json();
  } catch (parseError) {
    if (!res.ok) {
      throw new ApiException(
        'NETWORK_ERROR',
        `Request failed: ${res.status}`,
        res.status
      );
    }
    throw parseError;
  }

  if (!res.ok) {
    throw new ApiException(
      data.error?.code || 'REQUEST_FAILED',
      data.error?.message || `Request failed: ${res.status}`,
      res.status,
      data.error?.details
    );
  }

  return data.data ?? data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    phone: string;
    name: string;
    role: 'customer' | 'worker' | 'admin';
  }) => request<{ user: any; session: any }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (email: string, password: string) =>
    request<{ user: any; session: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  demoLogin: async (role: 'customer' | 'worker' | 'cooperative') => {
    // ROLE MAPPING: Frontend 'cooperative' → Backend 'admin'
    // The backend uses 'admin' for cooperative management role
    // Frontend uses 'cooperative' for product/UI terminology
    let email = 'customer@sahakar.org';
    let password = 'demo123';
    
    // Map frontend role to backend credentials
    if (role === 'worker') {
      email = 'rajesh@sahakar.org';
      password = 'demo123';
    } else if (role === 'cooperative') {
      // Frontend 'cooperative' → Backend 'admin' user
      email = 'admin@cooperative.org';
      password = 'admin123';
    }
    
    const data = await authApi.login(email, password);
    setToken(data.session.access_token);
    setStoredUser(data.user);
    return data;
  },

  me: () => request<{ user: any }>('/api/auth/me'),

  logout: () => request('/api/auth/logout', { method: 'POST' }),
};

// ─── Workers API ──────────────────────────────────────────────────────────────

export const workersApi = {
  getById: (id: string) => request<{ worker: any }>(`/api/workers/${id}`),

  getProfileMe: () => request<{ worker: any }>('/api/workers/profile/me'),

  create: (payload: {
    skills: Array<{ category: string; subcategory?: string; skill_level?: string }>;
    location: { lat: number; lng: number };
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    service_radius?: number;
    photo_url?: string;
  }) =>
    request<{ worker: any }>('/api/workers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateLocation: (workerId: string, lat: number, lng: number) =>
    request(`/api/workers/${workerId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    }),

  setAvailability: (workerId: string, available: boolean) =>
    request(`/api/workers/${workerId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    }),

  getEarnings: (period?: 'today' | 'week' | 'month' | 'total') =>
    request<{
      period: string;
      direct_service_earnings: number;
      cooperative_distribution: number;
      total_earnings: number;
      cooperative_pool: number;
      worker_work_amount: number;
      work_share_percentage: number;
      total_platform_work_amount: number;
      completed_jobs_count: number;
      platform_completed_jobs_count: number;
      wallet_balance: number;
      distributions: any[];
    }>(`/api/workers/profile/me/earnings${period ? '?period=' + period : ''}`),

  searchNearby: (lat: number, lng: number, serviceCategory: string) =>
    request<{ workers: any[]; total: number }>('/api/geospatial/workers/search', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, service_category: serviceCategory }),
    }),
};

// ─── Jobs API ─────────────────────────────────────────────────────────────────

export const jobsApi = {
  create: (payload: {
    service_category_id?: string;
    service_category_name: string;
    service_subcategory_name?: string;
    title?: string;
    description: string;
    address: string;
    location: { lat: number; lng: number };
    estimated_price?: number;
    min_budget?: number;
    max_budget?: number;
    preferred_date?: string;
    preferred_time?: string;
    urgency?: 'normal' | 'urgent' | 'emergency';
    worker_id?: string;
    problem_image_urls?: string[];
    additional_instructions?: string;
  }) => request<{ job: any }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ jobs: any[]; pagination: any }>(`/api/jobs${qs ? '?' + qs : ''}`);
  },

  getIncomingWorkerRequests: () => 
    request<{ requests: any[] }>('/api/jobs/worker/incoming'),

  getById: (id: string) => request<{ job: any }>(`/api/jobs/${id}`),

  getStatus: (id: string) => request<{ status: string; job?: any }>(`/api/jobs/${id}/status`),

  accept: (id: string) => request<{ job: any }>(`/api/jobs/${id}/accept`, { method: 'POST' }),

  reject: (id: string, reason?: string) => 
    request<{ message: string }>(`/api/jobs/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  updateStatus: (id: string, status: string, reason?: string) =>
    request<{ job: any }>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  /**
   * Customer cancellation — only works while no worker has accepted.
   * Backend will return 400 CANCELLATION_NOT_ALLOWED if the job is past
   * the cancellable window (accepted / on_the_way / arrived / etc.).
   */
  cancel: (id: string) =>
    request<{ job: any }>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' }),
    }),

  dispute: (id: string, reason: string) =>
    request(`/api/jobs/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ─── Files API ───────────────────────────────────────────────────────────────

export const filesApi = {
  uploadJobPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);

    return request<{ url: string }>('/api/files/upload/job-photo', {
      method: 'POST',
      body: formData,
    });
  },
};

// ─── Payments API ─────────────────────────────────────────────────────────────

export const paymentsApi = {
  /**
   * Creates a Razorpay order for a completed job.
   * Amount is determined server-side — do NOT pass an amount.
   * Returns: { orderId, amount (paise), amountInr, currency, keyId, description }
   */
  createOrder: (jobId: string) =>
    request<{
      orderId: string;
      amount: number;
      amountInr: number;
      currency: string;
      keyId: string;
      paymentRowId: string;
      description: string;
    }>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId }),
    }),

  /**
   * Sends Razorpay callback fields to the backend for HMAC-SHA256 verification.
   * Only called after Razorpay Checkout succeeds on the client.
   * The backend verifies the signature before marking the payment complete.
   */
  verify: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<{
      message: string;
      amount: number;
      razorpay_payment_id: string;
      status: string;
    }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getWallet: (workerId: string) =>
    request<{ wallet: any }>(`/api/payments/wallet/${workerId}`),

  getTransactions: () => request<{ transactions: any[] }>('/api/payments/transactions'),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────

export const reviewsApi = {
  submit: (jobId: string, rating: number, comment?: string) =>
    request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, rating, comment }),
    }),

  getForWorker: (workerId: string, page = 1) =>
    request<{ reviews: any[]; average_rating: number; total_reviews: number }>(
      `/api/reviews/worker/${workerId}?page=${page}`
    ),
};

// ─── ML API ───────────────────────────────────────────────────────────────────

export const mlApi = {
  getDemandForecast: (days = 7) =>
    request<{ forecasts: any[]; historical_actuals: any; model_info: any }>(
      `/api/ml/forecast/demand?days=${days}`
    ),

  getSkillGaps: () =>
    request<{ skill_gaps: any[]; top_training_recommendations: any[] }>(
      '/api/ml/analysis/skill-gaps'
    ),

  getSurge: (serviceCategory?: string) => {
    const qs = serviceCategory ? `?service_category=${serviceCategory}` : '';
    return request<{ surge_multiplier: number; reason: string; is_surge_active: boolean }>(
      `/api/ml/pricing/surge${qs}`
    );
  },

  getWorkerTrainingRecommendations: (workerId: string) =>
    request<{ performance: any; recommendations: any[]; insights: any[] }>(
      `/api/ml/worker/${workerId}/training-recommendations`
    ),

  analyzeImage: async (imageFile: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', imageFile);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/ml/analyze-image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new ApiException(
      data.error?.code || 'ANALYSIS_FAILED',
      data.error?.message || 'Image analysis failed',
      res.status,
    );
    return data.data;
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => request<any>('/api/admin/dashboard'),
  getWorkers: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ workers: any[]; pagination: any }>(`/api/admin/workers${qs ? '?' + qs : ''}`);
  },
  approveWorker: (id: string) =>
    request(`/api/admin/workers/${id}/approve`, {
      method: 'PATCH',
    }),
  rejectWorker: (id: string, reason?: string) =>
    request(`/api/admin/workers/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  getJobs: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ jobs: any[]; status_breakdown: any }>(`/api/admin/jobs${qs ? '?' + qs : ''}`);
  },
  getFinancials: () => request<any>('/api/admin/financials'),
  getEarnings: () => request<any>('/api/admin/earnings'),
  getDisputes: () => request<{ disputes: any[] }>('/api/admin/disputes'),
  resolveDispute: (id: string, resolution: 'customer_favor' | 'worker_favor') =>
    request(`/api/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution }),
    }),
  distributeSurplus: (period: string) =>
    request<any>('/api/admin/distribute-surplus', {
      method: 'POST',
      body: JSON.stringify({ period }),
    }),
};

// ─── Services API ─────────────────────────────────────────────────────────────

export const servicesApi = {
  getCategories: () =>
    request<{ categories: any[] }>('/api/services'),
};

export const notificationsApi = {
  list: () => request<{ notifications: any[]; unread_count: number }>('/api/notifications'),
  markRead: (id: string) => request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/api/notifications/read-all', { method: 'PATCH' }),
};

// ─── Geospatial API ───────────────────────────────────────────────────────────

export const geospatialApi = {
  reverseGeocode: (lat: number, lng: number) =>
    request<{
      address: string;
      locality?: string;
      city?: string;
      state?: string;
      pincode?: string;
      coordinates: { lat: number; lng: number };
    }>(`/api/geospatial/reverse-geocode?lat=${lat}&lng=${lng}`),

  searchNearby: (lat: number, lng: number, serviceCategory: string) =>
    request<{ workers: any[]; total: number }>('/api/geospatial/workers/search', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, service_category: serviceCategory }),
    }),

  getDistance: (lat1: number, lng1: number, lat2: number, lng2: number) =>
    request<{
      distance_km: number;
      distance_formatted: string;
      eta_minutes: number;
      eta_formatted: string;
    }>(`/api/geospatial/distance?lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}`),
};

