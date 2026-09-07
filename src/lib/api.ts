/**
 * API Client for SAHAKAR Backend
 * Centralizes all API calls and auth token management
 * 
 * ARCHITECTURE:
 * Raw Backend Response → This Layer → API Adapters → Frontend Components
 */

// CRITICAL: Backend runs on port 3000, not 4000
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// ─── Auth Token Management ───────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('sahakar_token');
}

export function setToken(token: string): void {
  localStorage.setItem('sahakar_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('sahakar_token');
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

  /**
   * Checks if error is a specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }

  /**
   * Checks if error is an authentication error
   */
  isAuthError(): boolean {
    return this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN' || this.status === 401 || this.status === 403;
  }

  /**
   * Checks if error is a validation error
   */
  isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' || this.status === 400;
  }

  /**
   * Checks if error is a network/server error
   */
  isNetworkError(): boolean {
    return this.code === 'SERVER_UNAVAILABLE' || this.code === 'NETWORK_ERROR' || this.status === 0;
  }

  /**
   * Checks if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.code === 'NOT_FOUND' || this.status === 404;
  }
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
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

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

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
      // Backend error response
      throw new ApiException(
        data.error?.code || 'REQUEST_FAILED',
        data.error?.message || `Request failed: ${res.status}`,
        res.status,
        data.error?.details
      );
    }

    return data.data ?? data;
  } catch (error) {
    // Network error (server unavailable)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiException(
        'SERVER_UNAVAILABLE',
        'Unable to connect to server. Please check your connection.',
        0
      );
    }
    throw error;
  }
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
    description: string;
    address: string;
    location: { lat: number; lng: number };
    estimated_price: number;
    worker_id?: string;
    problem_image_urls?: string[];
  }) => request<{ job: any }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  list: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ jobs: any[]; pagination: any }>(`/api/jobs${qs ? '?' + qs : ''}`);
  },

  getById: (id: string) => request<{ job: any }>(`/api/jobs/${id}`),

  getStatus: (id: string) => request<{ status: string; job?: any }>(`/api/jobs/${id}/status`),

  accept: (id: string) => request<{ job: any }>(`/api/jobs/${id}/accept`, { method: 'POST' }),

  updateStatus: (id: string, status: string, reason?: string) =>
    request<{ job: any }>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
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
  createOrder: (jobId: string, amount: number) =>
    request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, amount }),
    }),

  verify: (paymentId: string, status: 'success' | 'failed') =>
    request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, status }),
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

    const res = await fetch(`${API_BASE}/api/ml/analyze-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Image analysis failed');
    return data.data;
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => request<any>('/api/admin/dashboard'),
  getWorkers: (params?: { status?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ workers: any[]; pagination: any }>(`/api/admin/workers${qs ? '?' + qs : ''}`);
  },
  getJobs: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ jobs: any[]; status_breakdown: any }>(`/api/admin/jobs${qs ? '?' + qs : ''}`);
  },
  getFinancials: () => request<any>('/api/admin/financials'),
  getDisputes: () => request<{ disputes: any[] }>('/api/admin/disputes'),
  resolveDispute: (id: string, resolution: 'customer_favor' | 'worker_favor') =>
    request(`/api/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution }),
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
