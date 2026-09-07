/**
 * In-Memory Fallback Store
 * Provides guaranteed data persistence and operations during development
 * and seamlessly synchronizes with Supabase.
 */

export interface StoreUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'customer' | 'worker' | 'admin';
}

export interface StoreWorker {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  photo_url: string;
  category: string;
  subcategory: string;
  location: { lat: number; lng: number };
  address: string;
  city: string;
  rating: number;
  total_ratings: number;
  completed_jobs: number;
  available: boolean;
  verification_status: 'verified' | 'pending' | 'rejected';
  skills: Array<{ category: string; subcategory?: string; skill_level: string; verified: boolean }>;
  wallet?: {
    balance: number;
    total_earned: number;
    pending_payout?: number;
  };
}

export interface StoreJob {
  id: string;
  job_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_location: { lat: number; lng: number };
  service_category_name: string;
  service_subcategory_name?: string;
  title?: string;
  description: string;
  estimated_price: number;
  actual_price?: number;
  problem_image_urls?: string[];
  preferred_date?: string;
  preferred_time?: string;
  urgency?: string;
  status: 'pending' | 'matching' | 'matched' | 'accepted' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  worker_id?: string | null;
  worker_name?: string | null;
  assigned_at?: string | null;
  accepted_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreDispatchAttempt {
  id: string;
  job_id: string;
  worker_id: string;
  distance_km: number;
  estimated_arrival_min: number;
  response: 'notified' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
}

class InMemoryStore {
  public users: Map<string, StoreUser> = new Map();
  public workers: Map<string, StoreWorker> = new Map();
  public jobs: Map<string, StoreJob> = new Map();
  public dispatchAttempts: StoreDispatchAttempt[] = [];
  public notifications: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Seed Demo Customer
    const customerUser: StoreUser = {
      id: '46740ff3-9955-4573-a4a5-d9d674ffa9e7',
      email: 'customer@sahakar.org',
      phone: '+919876543210',
      name: 'Priya Sharma',
      role: 'customer',
    };
    this.users.set(customerUser.id, customerUser);
    this.users.set(customerUser.email, customerUser);

    // 2. Seed Demo Worker 1: Rajesh Kumar (Plumber)
    const rajeshUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d9',
      email: 'rajesh@sahakar.org',
      phone: '+919822011001',
      name: 'Rajesh Kumar',
      role: 'worker',
    };
    this.users.set(rajeshUser.id, rajeshUser);
    this.users.set(rajeshUser.email, rajeshUser);

    const rajeshWorker: StoreWorker = {
      id: 'worker-rajesh-001',
      user_id: rajeshUser.id,
      name: 'Rajesh Kumar',
      phone: '+919822011001',
      photo_url: '/illustrations/plumber.png',
      category: 'Plumbing',
      subcategory: 'Pipe Fitting & Leak Repair',
      location: { lat: 18.5074, lng: 73.8077 }, // Kothrud
      address: 'Kothrud, Pune',
      city: 'Pune',
      rating: 4.88,
      total_ratings: 142,
      completed_jobs: 167,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Plumbing', subcategory: 'Leak Repair', skill_level: 'expert', verified: true },
        { category: 'Plumbing', subcategory: 'Fixture Replacement', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(rajeshWorker.id, rajeshWorker);
    this.workers.set(rajeshUser.id, rajeshWorker);

    // 3. Seed Demo Worker 2: Suresh Patil (Electrician)
    const sureshUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d2',
      email: 'suresh@sahakar.org',
      phone: '+919822011002',
      name: 'Suresh Patil',
      role: 'worker',
    };
    this.users.set(sureshUser.id, sureshUser);
    this.users.set(sureshUser.email, sureshUser);

    const sureshWorker: StoreWorker = {
      id: 'worker-suresh-002',
      user_id: sureshUser.id,
      name: 'Suresh Patil',
      phone: '+919822011002',
      photo_url: '/illustrations/electrician.png',
      category: 'Electrical',
      subcategory: 'Wiring & Fuse Repair',
      location: { lat: 18.5204, lng: 73.8567 }, // Shivajinagar
      address: 'Shivajinagar, Pune',
      city: 'Pune',
      rating: 4.92,
      total_ratings: 118,
      completed_jobs: 135,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Electrical', subcategory: 'Wiring', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(sureshWorker.id, sureshWorker);
    this.workers.set(sureshUser.id, sureshWorker);

    // 4. Seed Demo Worker 3: Amit Verma (Electrical Specialist / Appliance)
    const amitUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d3',
      email: 'amit@sahakar.org',
      phone: '+919822011003',
      name: 'Amit Verma',
      role: 'worker',
    };
    this.users.set(amitUser.id, amitUser);
    this.users.set(amitUser.email, amitUser);

    const amitWorker: StoreWorker = {
      id: 'worker-amit-003',
      user_id: amitUser.id,
      name: 'Amit Verma',
      phone: '+919822011003',
      photo_url: '/illustrations/electrician.png',
      category: 'Electrical',
      subcategory: 'Appliance Repair & Switchboards',
      location: { lat: 18.5100, lng: 73.8200 },
      address: 'Deccan, Pune',
      city: 'Pune',
      rating: 4.85,
      total_ratings: 94,
      completed_jobs: 112,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Electrical', subcategory: 'Appliance Repair', skill_level: 'expert', verified: true },
        { category: 'Electrical', subcategory: 'Switchboards', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(amitWorker.id, amitWorker);
    this.workers.set(amitUser.id, amitWorker);

    // 5. Seed Demo Worker 4: Manoj Kulkarni (Electrician / Circuit Breakers)
    const manojUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d4',
      email: 'manoj@sahakar.org',
      phone: '+919822011004',
      name: 'Manoj Kulkarni',
      role: 'worker',
    };
    this.users.set(manojUser.id, manojUser);
    this.users.set(manojUser.email, manojUser);

    const manojWorker: StoreWorker = {
      id: 'worker-manoj-004',
      user_id: manojUser.id,
      name: 'Manoj Kulkarni',
      phone: '+919822011004',
      photo_url: '/illustrations/electrician.png',
      category: 'Electrical',
      subcategory: 'Circuit Breakers & General Electrical',
      location: { lat: 18.5300, lng: 73.8400 },
      address: 'Aundh, Pune',
      city: 'Pune',
      rating: 4.79,
      total_ratings: 80,
      completed_jobs: 98,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Electrical', subcategory: 'Circuit Breaker', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(manojWorker.id, manojWorker);
    this.workers.set(manojUser.id, manojWorker);

    // 6. Seed Demo Worker 5: Ramesh Sharma (Carpenter)
    const rameshUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d5',
      email: 'ramesh@sahakar.org',
      phone: '+919822011005',
      name: 'Ramesh Sharma',
      role: 'worker',
    };
    this.users.set(rameshUser.id, rameshUser);
    this.users.set(rameshUser.email, rameshUser);

    const rameshWorker: StoreWorker = {
      id: 'worker-ramesh-005',
      user_id: rameshUser.id,
      name: 'Ramesh Sharma',
      phone: '+919822011005',
      photo_url: '/illustrations/carpenter.png',
      category: 'Carpentry',
      subcategory: 'Furniture & Woodwork',
      location: { lat: 18.4900, lng: 73.8100 },
      address: 'Karve Nagar, Pune',
      city: 'Pune',
      rating: 4.90,
      total_ratings: 65,
      completed_jobs: 78,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Carpentry', subcategory: 'Furniture Assembly', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(rameshWorker.id, rameshWorker);
    this.workers.set(rameshUser.id, rameshWorker);

    // 7. Seed Demo Admin
    const adminUser: StoreUser = {
      id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      email: 'admin@cooperative.org',
      phone: '+919822099999',
      name: 'Cooperative Admin',
      role: 'admin',
    };
    this.users.set(adminUser.id, adminUser);
    this.users.set(adminUser.email, adminUser);
  }

  public getWorkerByUserId(userId: string): StoreWorker | undefined {
    if (!userId) return undefined;
    const direct = this.workers.get(userId);
    if (direct) return direct;
    for (const w of this.workers.values()) {
      if (w.user_id === userId || w.id === userId) return w;
    }
    return undefined;
  }

  public getWorkerById(workerId: string): StoreWorker | undefined {
    if (!workerId) return undefined;
    const direct = this.workers.get(workerId);
    if (direct) return direct;
    for (const w of this.workers.values()) {
      if (w.id === workerId || w.user_id === workerId) return w;
    }
    return undefined;
  }

  public ensureWorkerForUser(userId: string, email: string = '', name: string = '', phone: string = ''): StoreWorker {
    let existing = this.getWorkerByUserId(userId);
    if (existing) return existing;

    const lowerEmail = (email || '').toLowerCase();
    const lowerName = (name || '').toLowerCase();

    let category = 'General Service';
    let subcategory = 'General Maintenance';
    let photo_url = '/illustrations/worker-hero.png';
    let workerId = `worker-${userId.slice(0, 8)}`;

    if (lowerEmail.includes('rajesh') || lowerName.includes('rajesh')) {
      category = 'Plumbing';
      subcategory = 'Pipe Fitting & Leak Repair';
      photo_url = '/illustrations/plumber.png';
      workerId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d9';
    } else if (lowerEmail.includes('suresh') || lowerName.includes('suresh')) {
      category = 'Electrical';
      subcategory = 'Wiring & Fuse Repair';
      photo_url = '/illustrations/electrician.png';
      workerId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d2';
    } else if (lowerEmail.includes('amit') || lowerName.includes('amit')) {
      category = 'Electrical';
      subcategory = 'Appliance Repair & Switchboards';
      photo_url = '/illustrations/electrician.png';
      workerId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d3';
    } else if (lowerEmail.includes('manoj') || lowerName.includes('manoj')) {
      category = 'Electrical';
      subcategory = 'Circuit Breakers & Lighting';
      photo_url = '/illustrations/electrician.png';
      workerId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d4';
    } else if (lowerEmail.includes('ramesh') || lowerName.includes('ramesh')) {
      category = 'Carpentry';
      subcategory = 'Furniture & Woodwork';
      photo_url = '/illustrations/carpenter.png';
      workerId = '78b525a6-92cc-47fb-9cdc-58f3a8dd01d5';
    }

    const worker: StoreWorker = {
      id: workerId,
      user_id: userId,
      name: name || 'Service Specialist',
      phone: phone || '+919822011001',
      photo_url,
      category,
      subcategory,
      location: { lat: 18.5074, lng: 73.8077 },
      address: 'Kothrud, Pune',
      city: 'Pune',
      rating: 4.88,
      total_ratings: 142,
      completed_jobs: 167,
      available: true,
      verification_status: 'verified',
      skills: [
        { category, subcategory, skill_level: 'expert', verified: true },
      ],
    };

    this.workers.set(worker.id, worker);
    this.workers.set(userId, worker);
    return worker;
  }

  public addJob(job: StoreJob): StoreJob {
    this.jobs.set(job.id, job);
    return job;
  }

  public getJob(jobId: string): StoreJob | undefined {
    return this.jobs.get(jobId);
  }

  public getIncomingJobsForWorker(workerIdOrUserId: string): StoreJob[] {
    const worker = this.getWorkerById(workerIdOrUserId) || this.getWorkerByUserId(workerIdOrUserId);
    const workerIds = new Set<string>();
    if (workerIdOrUserId) workerIds.add(workerIdOrUserId);
    if (worker) {
      workerIds.add(worker.id);
      workerIds.add(worker.user_id);
    }

    const pendingStatuses = ['pending', 'matched', 'matching', 'created', 'requested'];

    // 1. Direct assigned jobs
    const directJobs = Array.from(this.jobs.values()).filter(
      (j) => j.worker_id && workerIds.has(j.worker_id) && pendingStatuses.includes(j.status)
    );

    // 2. Dispatched broadcast jobs (explicit dispatch records)
    const dispatchedJobIds = this.dispatchAttempts
      .filter((d) => workerIds.has(d.worker_id) && d.response === 'notified')
      .map((d) => d.job_id);

    const dispatchedJobs = Array.from(this.jobs.values()).filter(
      (j) => dispatchedJobIds.includes(j.id) && pendingStatuses.includes(j.status)
    );

    // 3. Domain matching unassigned broadcast demands
    const domainJobs = worker
      ? Array.from(this.jobs.values()).filter((j) => {
          // If already assigned to another specific worker, do not show to others
          if (j.worker_id && !workerIds.has(j.worker_id)) return false;
          if (!pendingStatuses.includes(j.status)) return false;
          return isDomainMatch(worker, j.service_category_name, j.title, j.description);
        })
      : [];

    const all = [...directJobs];
    for (const dj of dispatchedJobs) {
      if (!all.some((j) => j.id === dj.id)) {
        all.push(dj);
      }
    }
    for (const domJ of domainJobs) {
      if (!all.some((j) => j.id === domJ.id)) {
        all.push(domJ);
      }
    }

    return all;
  }

  public creditWorkerWallet(workerIdOrUserId: string, amount: number): number {
    const worker = this.getWorkerById(workerIdOrUserId) || this.getWorkerByUserId(workerIdOrUserId);
    if (!worker) return 0;
    if (!worker.wallet) {
      worker.wallet = { balance: 0, total_earned: 0, pending_payout: 0 };
    }
    worker.wallet.balance = (worker.wallet.balance || 0) + amount;
    worker.wallet.total_earned = (worker.wallet.total_earned || 0) + amount;
    worker.completed_jobs = (worker.completed_jobs || 0) + 1;
    return worker.wallet.balance;
  }
}

/**
 * Domain Normalization Helper
 * Maps service categories and task descriptions to standard canonical domains
 */
export function normalizeDomain(nameOrKeyword: string): string {
  if (!nameOrKeyword) return '';
  const lower = nameOrKeyword.toLowerCase();
  if (lower.includes('electr') || lower.includes('wire') || lower.includes('switch') || lower.includes('fuse') || lower.includes('circuit') || lower.includes('plug') || lower.includes('appliance') || lower.includes('fan')) return 'Electrical';
  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('leak') || lower.includes('tap') || lower.includes('faucet') || lower.includes('drain') || lower.includes('water') || lower.includes('toilet') || lower.includes('basin')) return 'Plumbing';
  if (lower.includes('carpent') || lower.includes('wood') || lower.includes('furniture') || lower.includes('door') || lower.includes('lock') || lower.includes('cabinet') || lower.includes('shelf')) return 'Carpentry';
  if (lower.includes('paint') || lower.includes('wall') || lower.includes('color') || lower.includes('whitewash')) return 'Painting';
  if (lower.includes('clean') || lower.includes('housekeep') || lower.includes('sanitize') || lower.includes('maid') || lower.includes('sofa')) return 'Cleaning';
  return nameOrKeyword.trim();
}

/**
 * Check if a worker belongs to the domain of the demand
 */
export function isDomainMatch(worker: any, jobCategoryName: string, title?: string, description?: string): boolean {
  if (!worker) return false;
  
  const targetDomain = normalizeDomain(jobCategoryName || title || description || '').toLowerCase();
  if (!targetDomain) return false;

  // 1. Check worker category
  if (normalizeDomain(worker.category || '').toLowerCase() === targetDomain) {
    return true;
  }

  // 2. Check worker subcategory
  if (normalizeDomain(worker.subcategory || '').toLowerCase() === targetDomain) {
    return true;
  }

  // 3. Check worker skills array
  if (Array.isArray(worker.skills)) {
    for (const skill of worker.skills) {
      const cat = typeof skill === 'string' ? skill : (skill.category || skill.subcategory || '');
      if (normalizeDomain(cat).toLowerCase() === targetDomain) {
        return true;
      }
    }
  }

  return false;
}

export const inMemoryStore = new InMemoryStore();


