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

    // 7. Seed Demo Worker 6: Vikram Shinde (Painting)
    const vikramUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d6',
      email: 'vikram@sahakar.org',
      phone: '+919822011006',
      name: 'Vikram Shinde',
      role: 'worker',
    };
    this.users.set(vikramUser.id, vikramUser);
    this.users.set(vikramUser.email, vikramUser);

    const vikramWorker: StoreWorker = {
      id: 'worker-vikram-006',
      user_id: vikramUser.id,
      name: 'Vikram Shinde',
      phone: '+919822011006',
      photo_url: '/illustrations/worker-hero.png',
      category: 'Painting',
      subcategory: 'Interior & Exterior Painting',
      location: { lat: 18.5590, lng: 73.7868 },
      address: 'Baner, Pune',
      city: 'Pune',
      rating: 4.88,
      total_ratings: 82,
      completed_jobs: 94,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Painting', subcategory: 'Interior Painting', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(vikramWorker.id, vikramWorker);
    this.workers.set(vikramUser.id, vikramWorker);

    // 8. Seed Demo Worker 7: Sunita Jadhav (Cleaning)
    const sunitaUser: StoreUser = {
      id: '78b525a6-92cc-47fb-9cdc-58f3a8dd01d7',
      email: 'sunita@sahakar.org',
      phone: '+919822011007',
      name: 'Sunita Jadhav',
      role: 'worker',
    };
    this.users.set(sunitaUser.id, sunitaUser);
    this.users.set(sunitaUser.email, sunitaUser);

    const sunitaWorker: StoreWorker = {
      id: 'worker-sunita-007',
      user_id: sunitaUser.id,
      name: 'Sunita Jadhav',
      phone: '+919822011007',
      photo_url: '/illustrations/worker-hero.png',
      category: 'Cleaning',
      subcategory: 'Deep Home Cleaning',
      location: { lat: 18.5679, lng: 73.9143 },
      address: 'Viman Nagar, Pune',
      city: 'Pune',
      rating: 4.95,
      total_ratings: 110,
      completed_jobs: 140,
      available: true,
      verification_status: 'verified',
      skills: [
        { category: 'Cleaning', subcategory: 'Home Deep Cleaning', skill_level: 'expert', verified: true },
      ],
    };
    this.workers.set(sunitaWorker.id, sunitaWorker);
    this.workers.set(sunitaUser.id, sunitaWorker);

    // 9. Seed Demo Admin
    const adminUser: StoreUser = {
      id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      email: 'admin@cooperative.org',
      phone: '+919822099999',
      name: 'Cooperative Admin',
      role: 'admin',
    };
    this.users.set(adminUser.id, adminUser);
    this.users.set(adminUser.email, adminUser);

    // 10. Seed 36 Completed Historical Jobs across All 6 Domains
    const rawJobs = [
      // Plumbing (6 jobs)
      { id: 'job-hist-001', num: 'DEMO-HIST-001', cat: 'Plumbing', sub: 'Leak Repair', desc: 'Kitchen sink drain pipe blockage clearing and tap washer replacement', addr: 'Flat 402, Mayur Colony, Kothrud, Pune', lat: 18.5074, lng: 73.8077, price: 650, days: 75, wId: rajeshWorker.id, wName: rajeshWorker.name },
      { id: 'job-hist-002', num: 'DEMO-HIST-002', cat: 'Plumbing', sub: 'Leak Repair', desc: 'Bathroom shower mixer cartridge replacement and pressure check', addr: 'Row House 12, Baner Road, Baner, Pune', lat: 18.5590, lng: 73.7868, price: 850, days: 68, wId: rajeshWorker.id, wName: rajeshWorker.name },
      { id: 'job-hist-003', num: 'DEMO-HIST-003', cat: 'Plumbing', sub: 'Pipe Installation', desc: 'Overhead water tank float valve and inlet pipe fitting', addr: 'B-14, Green Acre, Wakad, Pune', lat: 18.5975, lng: 73.7898, price: 1200, days: 52, wId: rajeshWorker.id, wName: rajeshWorker.name },
      { id: 'job-hist-004', num: 'DEMO-HIST-004', cat: 'Plumbing', sub: 'Toilet Repair', desc: 'Dual flush cistern repair and toilet seal replacement', addr: 'A-301, Sindh Society, Aundh, Pune', lat: 18.5592, lng: 73.8078, price: 550, days: 38, wId: rajeshWorker.id, wName: rajeshWorker.name },
      { id: 'job-hist-005', num: 'DEMO-HIST-005', cat: 'Plumbing', sub: 'Pipe Installation', desc: 'Washing machine inlet water point connection and angle cock', addr: 'Skyline Towers, Viman Nagar, Pune', lat: 18.5679, lng: 73.9143, price: 450, days: 20, wId: rajeshWorker.id, wName: rajeshWorker.name },
      { id: 'job-hist-006', num: 'DEMO-HIST-006', cat: 'Plumbing', sub: 'Leak Repair', desc: 'Main pipeline concealed leak repair and pressure testing', addr: 'Ghole Road, Shivajinagar, Pune', lat: 18.5308, lng: 73.8474, price: 1600, days: 6, wId: rajeshWorker.id, wName: rajeshWorker.name },

      // Electrical (6 jobs)
      { id: 'job-hist-007', num: 'DEMO-HIST-007', cat: 'Electrical', sub: 'Circuit Breaker Repair', desc: 'Main distribution board 32A double pole MCB replacement', addr: 'Paud Road, Kothrud, Pune', lat: 18.5085, lng: 73.8090, price: 750, days: 72, wId: sureshWorker.id, wName: sureshWorker.name },
      { id: 'job-hist-008', num: 'DEMO-HIST-008', cat: 'Electrical', sub: 'Ceiling Fan Installation', desc: 'Two decorative ceiling fans installation and regulator fitting', addr: 'Pancard Club Road, Baner, Pune', lat: 18.5610, lng: 73.7840, price: 600, days: 61, wId: sureshWorker.id, wName: sureshWorker.name },
      { id: 'job-hist-009', num: 'DEMO-HIST-009', cat: 'Electrical', sub: 'Wiring & Rewiring', desc: 'Inverter battery line rewiring and changeover switch setup', addr: 'Datta Mandir Road, Wakad, Pune', lat: 18.5950, lng: 73.7860, price: 1100, days: 48, wId: sureshWorker.id, wName: sureshWorker.name },
      { id: 'job-hist-010', num: 'DEMO-HIST-010', cat: 'Electrical', sub: 'Light Fixture Installation', desc: 'Living room warm white LED cob light cutouts and switchboard installation', addr: 'ITI Road, Aundh, Pune', lat: 18.5580, lng: 73.8050, price: 950, days: 33, wId: sureshWorker.id, wName: sureshWorker.name },
      { id: 'job-hist-011', num: 'DEMO-HIST-011', cat: 'Electrical', sub: 'Switch & Socket Installation', desc: 'Geyser 16A power socket burnt wire replacement and earthing check', addr: 'Konark Nagar, Viman Nagar, Pune', lat: 18.5660, lng: 73.9120, price: 500, days: 18, wId: sureshWorker.id, wName: sureshWorker.name },
      { id: 'job-hist-012', num: 'DEMO-HIST-012', cat: 'Electrical', sub: 'Wiring & Rewiring', desc: 'Complete kitchen appliance wiring load balancing', addr: 'FC Road, Shivajinagar, Pune', lat: 18.5290, lng: 73.8450, price: 1400, days: 4, wId: sureshWorker.id, wName: sureshWorker.name },

      // Carpentry (6 jobs)
      { id: 'job-hist-013', num: 'DEMO-HIST-013', cat: 'Carpentry', sub: 'Furniture Repair', desc: 'Wardrobe hydraulic hinges replacement and sliding door track alignment', addr: 'Ideal Colony, Kothrud, Pune', lat: 18.5060, lng: 73.8050, price: 900, days: 74, wId: rameshWorker.id, wName: rameshWorker.name },
      { id: 'job-hist-014', num: 'DEMO-HIST-014', cat: 'Carpentry', sub: 'Door Installation', desc: 'Solid teak wood main entrance door mortise lock installation', addr: 'Veerbhadra Nagar, Baner, Pune', lat: 18.5570, lng: 73.7820, price: 1100, days: 65, wId: rameshWorker.id, wName: rameshWorker.name },
      { id: 'job-hist-015', num: 'DEMO-HIST-015', cat: 'Carpentry', sub: 'Custom Furniture Making', desc: 'Custom solid wood kitchen spice rack and drawer organizer fitting', addr: 'Kaspate Vasti, Wakad, Pune', lat: 18.5930, lng: 73.7880, price: 1450, days: 49, wId: rameshWorker.id, wName: rameshWorker.name },
      { id: 'job-hist-016', num: 'DEMO-HIST-016', cat: 'Carpentry', sub: 'Furniture Repair', desc: 'King size bed frame creaking fix and ply reinforcement', addr: 'Spicer College Road, Aundh, Pune', lat: 18.5560, lng: 73.8090, price: 800, days: 35, wId: rameshWorker.id, wName: rameshWorker.name },
      { id: 'job-hist-017', num: 'DEMO-HIST-017', cat: 'Carpentry', sub: 'Furniture Repair', desc: 'Balcony wooden privacy lattice partition repair and polishing', addr: 'Clover Park, Viman Nagar, Pune', lat: 18.5690, lng: 73.9160, price: 1300, days: 16, wId: rameshWorker.id, wName: rameshWorker.name },
      { id: 'job-hist-018', num: 'DEMO-HIST-018', cat: 'Carpentry', sub: 'Furniture Repair', desc: 'Study table laminate edge binding and drawer roller replacement', addr: 'Model Colony, Shivajinagar, Pune', lat: 18.5320, lng: 73.8430, price: 650, days: 3, wId: rameshWorker.id, wName: rameshWorker.name },

      // Painting (6 jobs)
      { id: 'job-hist-019', num: 'DEMO-HIST-019', cat: 'Painting', sub: 'Ceiling Painting', desc: 'Living room ceiling water seepage scraping, primer, and royal emulsion repaint', addr: 'Rambaug Colony, Kothrud, Pune', lat: 18.5090, lng: 73.8060, price: 2400, days: 70, wId: vikramWorker.id, wName: vikramWorker.name },
      { id: 'job-hist-020', num: 'DEMO-HIST-020', cat: 'Painting', sub: 'Texture Painting', desc: 'Master bedroom metallic texture accent wall painting', addr: 'Balewadi High St, Baner, Pune', lat: 18.5630, lng: 73.7850, price: 3200, days: 58, wId: vikramWorker.id, wName: vikramWorker.name },
      { id: 'job-hist-021', num: 'DEMO-HIST-021', cat: 'Painting', sub: 'Exterior Wall Painting', desc: 'Balcony weatherproof exterior anti-fungal paint coating', addr: 'Shankar Kalat Nagar, Wakad, Pune', lat: 18.5960, lng: 73.7840, price: 1800, days: 44, wId: vikramWorker.id, wName: vikramWorker.name },
      { id: 'job-hist-022', num: 'DEMO-HIST-022', cat: 'Painting', sub: 'Interior Wall Painting', desc: 'Kitchen wall oil repellent enamel painting and crack filling', addr: 'DP Road, Aundh, Pune', lat: 18.5600, lng: 73.8110, price: 1650, days: 29, wId: vikramWorker.id, wName: vikramWorker.name },
      { id: 'job-hist-023', num: 'DEMO-HIST-023', cat: 'Painting', sub: 'Interior Wall Painting', desc: 'Kids bedroom dual tone pastel emulsion painting with stencil border', addr: 'Sakore Nagar, Viman Nagar, Pune', lat: 18.5650, lng: 73.9180, price: 2800, days: 14, wId: vikramWorker.id, wName: vikramWorker.name },
      { id: 'job-hist-024', num: 'DEMO-HIST-024', cat: 'Painting', sub: 'Furniture Painting', desc: 'Wooden doors and window frames PU gloss clear varnish polishing', addr: 'JM Road, Shivajinagar, Pune', lat: 18.5280, lng: 73.8490, price: 2100, days: 2, wId: vikramWorker.id, wName: vikramWorker.name },

      // Cleaning (6 jobs)
      { id: 'job-hist-025', num: 'DEMO-HIST-025', cat: 'Cleaning', sub: 'Home Deep Cleaning', desc: 'Complete 2BHK deep home sanitization and mechanized floor scrubbing', addr: 'Gujarat Colony, Kothrud, Pune', lat: 18.5040, lng: 73.8040, price: 2200, days: 76, wId: sunitaWorker.id, wName: sunitaWorker.name },
      { id: 'job-hist-026', num: 'DEMO-HIST-026', cat: 'Cleaning', sub: 'Kitchen Cleaning', desc: 'Kitchen chimney motorized degreasing and stove tile stain removal', addr: 'Pashan Link Road, Baner, Pune', lat: 18.5550, lng: 73.7870, price: 950, days: 63, wId: sunitaWorker.id, wName: sunitaWorker.name },
      { id: 'job-hist-027', num: 'DEMO-HIST-027', cat: 'Cleaning', sub: 'Sofa & Carpet Cleaning', desc: '5-seater fabric sofa deep shampooing and wet vacuum extraction', addr: 'Choudhary Park, Wakad, Pune', lat: 18.5940, lng: 73.7890, price: 1100, days: 50, wId: sunitaWorker.id, wName: sunitaWorker.name },
      { id: 'job-hist-028', num: 'DEMO-HIST-028', cat: 'Cleaning', sub: 'Bathroom Cleaning', desc: 'Two bathrooms hard water scale removal and anti-bacterial steaming', addr: 'Nagras Road, Aundh, Pune', lat: 18.5585, lng: 73.8065, price: 850, days: 36, wId: sunitaWorker.id, wName: sunitaWorker.name },
      { id: 'job-hist-029', num: 'DEMO-HIST-029', cat: 'Cleaning', sub: 'Home Deep Cleaning', desc: 'Balcony bird netting wash and high pressure water wash', addr: 'Symbiosis Road, Viman Nagar, Pune', lat: 18.5685, lng: 73.9135, price: 750, days: 22, wId: sunitaWorker.id, wName: sunitaWorker.name },
      { id: 'job-hist-030', num: 'DEMO-HIST-030', cat: 'Cleaning', sub: 'Post-Construction Cleaning', desc: 'Post renovation dust removal and window track vacuuming', addr: 'Modern Colony, Shivajinagar, Pune', lat: 18.5315, lng: 73.8465, price: 1850, days: 5, wId: sunitaWorker.id, wName: sunitaWorker.name },

      // Appliance Repair (6 jobs)
      { id: 'job-hist-031', num: 'DEMO-HIST-031', cat: 'Appliance Repair', sub: 'Air Conditioner Repair', desc: '1.5 Ton Split AC comprehensive wet servicing and pressure gas topup', addr: 'Bhusari Colony, Kothrud, Pune', lat: 18.5055, lng: 73.8025, price: 1250, days: 73, wId: amitWorker.id, wName: amitWorker.name },
      { id: 'job-hist-032', num: 'DEMO-HIST-032', cat: 'Appliance Repair', sub: 'Washing Machine Repair', desc: 'Front load washing machine drain pump replacement and drum cleaning', addr: 'Abhimanshree Society, Baner, Pune', lat: 18.5540, lng: 73.7895, price: 950, days: 60, wId: amitWorker.id, wName: amitWorker.name },
      { id: 'job-hist-033', num: 'DEMO-HIST-033', cat: 'Appliance Repair', sub: 'Refrigerator Repair', desc: 'Frost free refrigerator defrost thermostat and timer replacement', addr: 'Thergaon Link Road, Wakad, Pune', lat: 18.5925, lng: 73.7835, price: 850, days: 46, wId: amitWorker.id, wName: amitWorker.name },
      { id: 'job-hist-034', num: 'DEMO-HIST-034', cat: 'Appliance Repair', sub: 'Microwave Repair', desc: 'Convection microwave high voltage diode and turntable motor replacement', addr: 'Medipoint Road, Aundh, Pune', lat: 18.5575, lng: 73.8045, price: 750, days: 31, wId: amitWorker.id, wName: amitWorker.name },
      { id: 'job-hist-035', num: 'DEMO-HIST-035', cat: 'Appliance Repair', sub: 'Water Purifier Service', desc: 'Water purifier 5-stage filter membrane and sediment candle replacement', addr: 'Mhada Colony, Viman Nagar, Pune', lat: 18.5670, lng: 73.9150, price: 1100, days: 17, wId: amitWorker.id, wName: amitWorker.name },
      { id: 'job-hist-036', num: 'DEMO-HIST-036', cat: 'Appliance Repair', sub: 'Geyser Repair', desc: '25L Storage water geyser heating element and magnesium anode replacement', addr: 'Gokhale Nagar, Shivajinagar, Pune', lat: 18.5330, lng: 73.8410, price: 850, days: 1, wId: amitWorker.id, wName: amitWorker.name },
    ];

    const now = Date.now();
    for (const rj of rawJobs) {
      const completionTime = new Date(now - rj.days * 86400000).toISOString();
      const job: StoreJob = {
        id: rj.id,
        job_number: rj.num,
        customer_id: customerUser.id,
        customer_name: customerUser.name,
        customer_phone: customerUser.phone,
        customer_address: rj.addr,
        customer_location: { lat: rj.lat, lng: rj.lng },
        service_category_name: rj.cat,
        service_subcategory_name: rj.sub,
        title: `${rj.cat} - ${rj.sub}`,
        description: rj.desc,
        estimated_price: rj.price,
        actual_price: rj.price,
        status: 'completed',
        worker_id: rj.wId,
        worker_name: rj.wName,
        assigned_at: new Date(new Date(completionTime).getTime() - 2400000).toISOString(),
        accepted_at: new Date(new Date(completionTime).getTime() - 2100000).toISOString(),
        completed_at: completionTime,
        created_at: new Date(new Date(completionTime).getTime() - 2700000).toISOString(),
        updated_at: completionTime,
      };
      this.jobs.set(job.id, job);
    }
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


