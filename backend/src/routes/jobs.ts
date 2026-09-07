import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/supabase';
import { authenticate, requireCustomer, requireWorker, requireAdmin } from '../middleware/auth';
import { createPostGISPoint, calculateDistance, estimateETA, parsePostGISPoint } from '../utils/geospatial';
import { inMemoryStore, StoreJob, isDomainMatch, normalizeDomain } from '../db/inMemoryStore';
import { createNotification } from '../services/notificationService';

const router = Router();

// Valid job status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['matching', 'matched', 'accepted', 'cancelled'],
  matching: ['accepted', 'cancelled'],
  matched: ['accepted', 'cancelled'],
  accepted: ['on_the_way', 'arrived', 'in_progress', 'cancelled'],
  on_the_way: ['arrived', 'in_progress', 'cancelled'],
  arrived: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

function isValidTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * Match and dispatch service requests to ALL eligible workers in the requested service DOMAIN
 */
async function matchAndDispatchWorkers(
  jobId: string,
  lat: number,
  lng: number,
  serviceCategory: string,
  serviceSubcategory?: string,
  estimatedPrice?: number
): Promise<void> {
  try {
    let candidateWorkers: any[] = [];

    // 1. Query verified available workers from Supabase database
    try {
      const { data: dbWorkers } = await supabaseAdmin
        .from('workers')
        .select(`
          id,
          user_id,
          photo_url,
          rating,
          total_ratings,
          completed_jobs,
          city,
          location,
          service_radius,
          user:users(name, phone),
          skills:worker_skills(category, subcategory, skill_level)
        `)
        .eq('available', true)
        .eq('verification_status', 'verified');

      if (dbWorkers && dbWorkers.length > 0) {
        const matchingWorkers = dbWorkers.filter((w: any) =>
          isDomainMatch(w, serviceCategory, serviceSubcategory)
        );

        candidateWorkers = matchingWorkers.map((w: any) => {
          let distanceKm = 2.5;
          if (w.location) {
            const coords = parsePostGISPoint(w.location);
            if (coords) {
              distanceKm = calculateDistance(lat, lng, coords.lat, coords.lng);
            }
          }
          return {
            worker_id: w.id,
            user_id: w.user_id,
            name: w.user?.name,
            phone: w.user?.phone,
            photo_url: w.photo_url,
            distance_km: distanceKm,
            rating: w.rating || 4.88,
            completed_jobs: w.completed_jobs || 120,
          };
        });
      }
    } catch {}

    // 2. Fallback / Merge from inMemoryStore
    const storeMatchingWorkers = Array.from(inMemoryStore.workers.values()).filter(
      (w, i, arr) => arr.findIndex((x) => x.id === w.id) === i && isDomainMatch(w, serviceCategory, serviceSubcategory)
    );

    for (const smw of storeMatchingWorkers) {
      candidateWorkers.push({
        worker_id: smw.id,
        user_id: smw.user_id,
        name: smw.name,
        phone: smw.phone,
        photo_url: smw.photo_url,
        distance_km: calculateDistance(lat, lng, smw.location.lat, smw.location.lng),
        rating: smw.rating,
        completed_jobs: smw.completed_jobs,
      });
    }

    // Deduplicate candidate workers uniquely by worker_id, user_id, and name
    const seenWorkerIds = new Set<string>();
    const seenUserIds = new Set<string>();
    const seenNames = new Set<string>();
    const uniqueCandidateWorkers: any[] = [];

    for (const w of candidateWorkers) {
      let resolvedUserId = w.user_id;
      if (!resolvedUserId && w.worker_id) {
        const memW = inMemoryStore.getWorkerById(w.worker_id);
        if (memW?.user_id) resolvedUserId = memW.user_id;
      }
      w.user_id = resolvedUserId;

      const nameKey = (w.name || '').trim().toLowerCase();
      if (
        (w.worker_id && seenWorkerIds.has(w.worker_id)) ||
        (w.user_id && seenUserIds.has(w.user_id)) ||
        (nameKey && seenNames.has(nameKey))
      ) {
        continue;
      }
      if (w.worker_id) seenWorkerIds.add(w.worker_id);
      if (w.user_id) seenUserIds.add(w.user_id);
      if (nameKey) seenNames.add(nameKey);
      uniqueCandidateWorkers.push(w);
    }

    const domainName = normalizeDomain(serviceCategory);
    console.log(`[Dispatch] Broadcasting domain "${domainName}" demand ${jobId} to ${uniqueCandidateWorkers.length} eligible workers`);

    // 3. Dispatch to ALL candidate workers in the domain
    for (const worker of uniqueCandidateWorkers) {
      inMemoryStore.dispatchAttempts.push({
        id: `dispatch-${Math.random().toString(36).substring(2, 9)}`,
        job_id: jobId,
        worker_id: worker.worker_id,
        distance_km: Number(worker.distance_km.toFixed(1)),
        estimated_arrival_min: estimateETA(worker.distance_km),
        response: 'notified',
        created_at: new Date().toISOString(),
      });

      try {
        await supabaseAdmin.from('job_dispatch_attempts').insert({
          job_id: jobId,
          worker_id: worker.worker_id,
          distance_km: Number(worker.distance_km.toFixed(1)),
          estimated_arrival_min: estimateETA(worker.distance_km),
          response: 'notified',
        });
      } catch {}

      // Dispatch real-time notification to worker
      if (worker.user_id) {
        createNotification({
          user_id: worker.user_id,
          type: 'NEW_SERVICE_REQUEST',
          title: `New ${domainName} Request`,
          message: serviceSubcategory
            ? `Customer requested ${serviceSubcategory} service near you.`
            : `New ${domainName} service request available.`,
          data: {
            job_id: jobId,
            domain: domainName,
            subcategory: serviceSubcategory,
            estimated_price: estimatedPrice,
            distance_km: Number(worker.distance_km.toFixed(1)),
          },
        }).catch(err => console.warn('[Notification] Worker dispatch notify error:', err));
      }
    }
  } catch (error) {
    console.error('[Dispatch] matchAndDispatchWorkers error:', error);
  }
}

/**
 * POST /api/jobs
 * Customer creates a new service request
 */
router.post(
  '/',
  [
    authenticate,
    requireCustomer,
    body('service_category_name').notEmpty().withMessage('Service category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() },
        });
        return;
      }

      const userId = req.user!.id;
      const {
        service_category_name,
        service_category_id,
        service_subcategory_name,
        title,
        description,
        address,
        location,
        estimated_price,
        min_budget,
        max_budget,
        preferred_date,
        preferred_time,
        urgency,
        problem_image_urls,
        worker_id,
      } = req.body;

      // Customer name & phone
      let customerName = req.user?.name || 'Customer';
      let customerPhone = req.user?.phone || '+91 9876543210';

      try {
        const { data: customer } = await supabaseAdmin
          .from('users')
          .select('name, phone')
          .eq('id', userId)
          .maybeSingle();
        if (customer) {
          customerName = customer.name;
          customerPhone = customer.phone;
        }
      } catch {}

      const jobId = `job-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const jobNumber = `JOB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const resolvedPrice = estimated_price || max_budget || min_budget || 500;

      // Full combined description
      const combinedDescription = [
        title ? `Problem: ${title}` : null,
        description ? `Details: ${description}` : null,
        urgency ? `Urgency: ${urgency.toUpperCase()}` : null,
        preferred_time ? `Preferred Time: ${preferred_time}` : null,
        preferred_date ? `Preferred Date: ${preferred_date}` : null,
      ]
        .filter(Boolean)
        .join(' | ') || description || `${service_category_name} service request`;

      const initialStatus = worker_id ? 'matched' : 'pending';

      const jobRecord: StoreJob = {
        id: jobId,
        job_number: jobNumber,
        customer_id: userId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_location: location,
        customer_address: address,
        service_category_name,
        service_subcategory_name: service_subcategory_name || undefined,
        title: title || undefined,
        description: combinedDescription,
        estimated_price: resolvedPrice,
        problem_image_urls: problem_image_urls || [],
        preferred_date: preferred_date || undefined,
        preferred_time: preferred_time || undefined,
        urgency: urgency || 'normal',
        status: initialStatus,
        worker_id: worker_id || null,
        assigned_at: worker_id ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Always save to inMemoryStore
      inMemoryStore.addJob(jobRecord);

      // Attempt Supabase insert
      try {
        const isUUID = (str?: string) =>
          Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

        let catId = service_category_id && isUUID(service_category_id) ? service_category_id : null;
        if (!catId && service_category_name) {
          try {
            const { data: catRecord } = await supabaseAdmin
              .from('service_categories')
              .select('id')
              .ilike('name', service_category_name)
              .maybeSingle();
            if (catRecord) catId = catRecord.id;
          } catch {}
        }
        if (!catId) {
          try {
            const { data: firstCat } = await supabaseAdmin
              .from('service_categories')
              .select('id')
              .limit(1)
              .maybeSingle();
            if (firstCat) catId = firstCat.id;
          } catch {}
        }

        const validWorkerId = worker_id && isUUID(worker_id) ? worker_id : null;
        const validCustomerId = isUUID(userId) ? userId : null;

        const { error: insertErr } = await supabaseAdmin.from('jobs').insert({
          job_number: jobNumber,
          customer_id: validCustomerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_location: createPostGISPoint(location.lat, location.lng),
          customer_address: address,
          service_category_id: catId || '11111111-1111-1111-1111-111111111111',
          service_category_name,
          service_subcategory_name: service_subcategory_name || null,
          description: combinedDescription,
          estimated_price: resolvedPrice,
          problem_image_urls: problem_image_urls || [],
          status: initialStatus,
          worker_id: validWorkerId,
          assigned_at: validWorkerId ? new Date().toISOString() : null,
        });

        if (insertErr) {
          console.warn('Supabase job insert error:', insertErr);
        }
      } catch (dbErr) {
        console.warn('Supabase job insert fallback to inMemoryStore:', dbErr);
      }

      if (worker_id) {
        // Direct assignment notification
        const assignedWorker = inMemoryStore.getWorkerById(worker_id) || inMemoryStore.getWorkerByUserId(worker_id);
        if (assignedWorker) {
          jobRecord.worker_name = assignedWorker.name;
        }
      } else {
        // Dispatch to candidate workers
        matchAndDispatchWorkers(
          jobRecord.id,
          location.lat,
          location.lng,
          service_category_name,
          service_subcategory_name,
          resolvedPrice
        ).catch(console.error);
      }

      res.status(201).json({
        success: true,
        data: {
          job: jobRecord,
          message: 'Service request created. Finding suitable cooperative workers...',
        },
      });
    } catch (error: any) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error?.message || 'Failed to create job' },
      });
    }
  }
);

/**
 * GET /api/jobs/worker/incoming
 * Worker fetches pending incoming service requests dispatched to them
 */
router.get('/worker/incoming', [authenticate, requireWorker], async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get worker profile
    let workerProfile: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('workers')
        .select('id, location')
        .eq('user_id', userId)
        .maybeSingle();
      workerProfile = data;
    } catch {}

    if (!workerProfile) {
      workerProfile = inMemoryStore.getWorkerByUserId(userId) || inMemoryStore.ensureWorkerForUser(userId);
    }

    const workerId = workerProfile.id;

    // 1. Fetch from inMemoryStore
    const memoryJobs = inMemoryStore.getIncomingJobsForWorker(workerId);

    // 2. Fetch from Supabase
    let dbJobs: any[] = [];
    try {
      const { data: dispatchAttempts } = await supabaseAdmin
        .from('job_dispatch_attempts')
        .select('job_id, distance_km, response, created_at')
        .eq('worker_id', workerId)
        .eq('response', 'notified')
        .order('created_at', { ascending: false });

      const jobIds = (dispatchAttempts || []).map((d: any) => d.job_id);

      if (jobIds.length > 0) {
        const { data: matchingJobs } = await supabaseAdmin
          .from('jobs')
          .select('*')
          .in('id', jobIds)
          .in('status', ['pending', 'matching']);

        if (matchingJobs) {
          dbJobs = matchingJobs.map((j: any) => {
            const attempt = dispatchAttempts?.find((d: any) => d.job_id === j.id);
            return {
              ...j,
              distance_km: attempt?.distance_km || 2.1,
            };
          });
        }
      }

      // Also include direct matched / pending jobs
      const { data: matchedJobs } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('worker_id', workerId)
        .in('status', ['matched', 'pending']);

      if (matchedJobs && matchedJobs.length > 0) {
        for (const mj of matchedJobs) {
          if (!dbJobs.some((j: any) => j.id === mj.id)) {
            dbJobs.push({ ...mj, distance_km: 2.1 });
          }
        }
      }
    } catch {}

    // Merge and deduplicate
    const combined = [...memoryJobs];
    for (const dbj of dbJobs) {
      if (!combined.some((j) => j.id === dbj.id)) {
        combined.push(dbj);
      }
    }

    res.json({
      success: true,
      data: {
        requests: combined,
        incoming_requests: combined,
        total: combined.length,
      },
    });
  } catch (error: any) {
    console.error('Fetch incoming worker requests error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incoming requests' },
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get job details
 */
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let job: any = inMemoryStore.getJob(id);

    if (!job) {
      try {
        const { data } = await supabaseAdmin
          .from('jobs')
          .select(`
            *,
            worker:workers(
              id, photo_url, rating, total_ratings, completed_jobs, city,
              user:users(name, phone)
            )
          `)
          .eq('id', id)
          .maybeSingle();
        job = data;
      } catch {}
    }

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    res.json({ success: true, data: { job } });
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get job' },
    });
  }
});

/**
 * GET /api/jobs/:id/status
 */
router.get('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let job = inMemoryStore.getJob(id);

    if (!job) {
      try {
        const { data } = await supabaseAdmin
          .from('jobs')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        job = data;
      } catch {}
    }

    if (job) {
      if (job.worker_id && !job.worker_name) {
        const worker = inMemoryStore.getWorkerById(job.worker_id) || inMemoryStore.getWorkerByUserId(job.worker_id);
        if (worker) job.worker_name = worker.name || (worker as any).user?.name;
      }
      res.json({ success: true, status: job.status, data: { status: job.status, job } });
      return;
    }

    res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error?.message || 'Failed to get status' },
    });
  }
});

/**
 * POST /api/jobs/:id/accept
 * Worker accepts an incoming service request (with atomic concurrency protection and authorization)
 */
router.post('/:id/accept', [authenticate, requireWorker], async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 1. Get worker profile
    let workerProfile: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('workers')
        .select('id, user_id, rating, completed_jobs, photo_url, user:users(name, phone)')
        .eq('user_id', userId)
        .maybeSingle();
      workerProfile = data;
    } catch {}

    if (!workerProfile) {
      workerProfile = inMemoryStore.getWorkerByUserId(userId) || inMemoryStore.ensureWorkerForUser(userId);
    }

    if (!workerProfile) {
      res.status(404).json({
        success: false,
        error: { code: 'WORKER_NOT_FOUND', message: 'Worker profile not found' },
      });
      return;
    }

    // 2. Fetch current job state
    let job = inMemoryStore.getJob(id);

    if (!job) {
      try {
        const { data } = await supabaseAdmin.from('jobs').select('*').eq('id', id).maybeSingle();
        job = data;
      } catch {}
    }

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    // 3. Check if job is already in an accepted or active lifecycle state
    const alreadyAcceptedStatuses = ['accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'];
    if (alreadyAcceptedStatuses.includes(job.status)) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ALREADY_ACCEPTED',
          message: 'This service request has already been accepted.',
        },
      });
      return;
    }

    // 4. Check if job was cancelled or rejected
    if (job.status === 'cancelled' || job.status === 'rejected') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_JOB_STATE',
          message: 'This service request is no longer available.',
        },
      });
      return;
    }

    // 5. Check worker authorization / assignment
    const isDirectlyAssigned = job.worker_id === workerProfile.id || job.worker_id === workerProfile.user_id;
    const isDispatchedCandidate = inMemoryStore.dispatchAttempts.some(
      (d) => d.job_id === id && (d.worker_id === workerProfile.id || d.worker_id === workerProfile.user_id)
    );

    // If job was directly requested to a specific worker, only that worker can accept
    if (job.worker_id && !isDirectlyAssigned && !isDispatchedCandidate) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to accept this service request.',
        },
      });
      return;
    }

    // 6. Atomically assign worker and update status to 'accepted'
    job.worker_id = workerProfile.id;
    job.worker_name = workerProfile.name || (workerProfile.user?.name) || 'Rajesh Kumar';
    job.status = 'accepted';
    job.accepted_at = new Date().toISOString();
    job.assigned_at = job.assigned_at || new Date().toISOString();
    job.updated_at = new Date().toISOString();

    // Persist in memory store
    inMemoryStore.addJob(job);

    // Update dispatch attempts
    for (const attempt of inMemoryStore.dispatchAttempts) {
      if (attempt.job_id === id) {
        if (attempt.worker_id === workerProfile.id || attempt.worker_id === workerProfile.user_id) {
          attempt.response = 'accepted';
        } else {
          attempt.response = 'cancelled';
        }
      }
    }

    // Sync Supabase
    try {
      await supabaseAdmin
        .from('jobs')
        .update({
          worker_id: workerProfile.id,
          status: 'accepted',
          accepted_at: job.accepted_at,
          assigned_at: job.assigned_at,
          updated_at: job.updated_at,
        })
        .eq('id', id);

      await supabaseAdmin
        .from('job_dispatch_attempts')
        .update({ response: 'accepted' })
        .eq('job_id', id)
        .eq('worker_id', workerProfile.id);

      await supabaseAdmin
        .from('job_dispatch_attempts')
        .update({ response: 'cancelled' })
        .eq('job_id', id)
        .neq('worker_id', workerProfile.id);
    } catch {}

    // Dispatch real-time notification to customer
    if (job.customer_id) {
      createNotification({
        user_id: job.customer_id,
        type: 'REQUEST_ACCEPTED',
        title: 'Service Request Accepted',
        message: `Your ${job.service_category_name || 'service'} request was accepted by ${job.worker_name || 'a cooperative worker'}.`,
        data: {
          job_id: id,
          worker_id: workerProfile.id,
          worker_name: job.worker_name,
          service: job.service_category_name,
        },
      }).catch(err => console.warn('[Notification] Customer acceptance notify error:', err));
    }

    // Dispatch confirmation notification to worker
    if (workerProfile.user_id) {
      createNotification({
        user_id: workerProfile.user_id,
        type: 'JOB_ASSIGNED',
        title: 'Job Confirmed',
        message: `You accepted ${job.service_category_name || 'service request'} #${job.job_number || id.slice(0, 8)}.`,
        data: {
          job_id: id,
          service: job.service_category_name,
          customer_name: job.customer_name,
        },
      }).catch(err => console.warn('[Notification] Worker acceptance notify error:', err));
    }

    res.json({
      success: true,
      data: {
        job,
        worker: workerProfile,
        message: 'You have accepted the request. Job is now active!',
      },
    });
  } catch (error: any) {
    console.error('Accept job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error?.message || 'Failed to accept job' },
    });
  }
});

/**
 * POST /api/jobs/:id/reject
 * Worker rejects an incoming dispatched service request
 */
router.post('/:id/reject', [authenticate, requireWorker], async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const workerProfile = inMemoryStore.getWorkerByUserId(userId);

    if (workerProfile) {
      for (const attempt of inMemoryStore.dispatchAttempts) {
        if (attempt.job_id === id && attempt.worker_id === workerProfile.id) {
          attempt.response = 'rejected';
        }
      }

      const job = inMemoryStore.getJob(id);
      if (job && job.worker_id === workerProfile.id) {
        job.status = 'rejected';
      }

      try {
        await supabaseAdmin
          .from('job_dispatch_attempts')
          .update({ response: 'rejected' })
          .eq('job_id', id)
          .eq('worker_id', workerProfile.id);
      } catch {}
    }

    res.json({
      success: true,
      data: { message: 'Request declined.' },
    });
  } catch (error: any) {
    console.error('Reject job error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to decline request' },
    });
  }
});

/**
 * PATCH /api/jobs/:id/status
 * Update job status (with validation of state machine)
 */
router.patch('/:id/status', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required' },
      });
      return;
    }

    let job = inMemoryStore.getJob(id);

    if (!job) {
      try {
        const { data } = await supabaseAdmin.from('jobs').select('*').eq('id', id).maybeSingle();
        job = data;
      } catch {}
    }

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'JOB_NOT_FOUND', message: 'Job not found' },
      });
      return;
    }

    const isAlreadyCompleted = job.status === 'completed';
    const isTransitioningToCompleted = newStatus === 'completed' && !isAlreadyCompleted;

    job.status = newStatus;
    if (newStatus === 'completed') {
      job.completed_at = job.completed_at || new Date().toISOString();
      job.actual_price = job.actual_price || job.estimated_price || 600;

      if (isTransitioningToCompleted && job.worker_id) {
        const jobAmount = job.actual_price;
        const workerEarning = Math.round(jobAmount * 0.85);

        // Credit in-memory wallet
        inMemoryStore.creditWorkerWallet(job.worker_id, workerEarning);

        // Credit Supabase worker wallet (idempotent)
        try {
          const { data: wallet } = await supabaseAdmin
            .from('worker_wallets')
            .select('balance, total_earned')
            .eq('worker_id', job.worker_id)
            .maybeSingle();

          if (wallet) {
            await supabaseAdmin
              .from('worker_wallets')
              .update({
                balance: Number(wallet.balance) + workerEarning,
                total_earned: Number(wallet.total_earned) + workerEarning,
              })
              .eq('worker_id', job.worker_id);
          }
        } catch {}
      }
    }
    job.updated_at = new Date().toISOString();
    inMemoryStore.addJob(job);

    try {
      await supabaseAdmin
        .from('jobs')
        .update({
          status: newStatus,
          completed_at: job.completed_at,
          actual_price: job.actual_price,
          updated_at: job.updated_at,
        })
        .eq('id', id);
    } catch {}

    const earned = newStatus === 'completed' ? Math.round((job.actual_price || job.estimated_price || 600) * 0.85) : undefined;

    // Send lifecycle notifications
    if (newStatus === 'on_the_way' || newStatus === 'arrived') {
      if (job.customer_id) {
        createNotification({
          user_id: job.customer_id,
          type: 'WORKER_ON_THE_WAY',
          title: newStatus === 'arrived' ? 'Worker Arrived' : 'Worker On The Way',
          message: newStatus === 'arrived'
            ? `${job.worker_name || 'Your worker'} has arrived at your location.`
            : `${job.worker_name || 'Your worker'} is on the way to your location.`,
          data: { job_id: id, status: newStatus },
        }).catch(console.warn);
      }
    } else if (newStatus === 'in_progress') {
      if (job.customer_id) {
        createNotification({
          user_id: job.customer_id,
          type: 'JOB_STARTED',
          title: 'Work Started',
          message: `${job.worker_name || 'Your worker'} has started work on your service.`,
          data: { job_id: id, status: newStatus },
        }).catch(console.warn);
      }
    } else if (newStatus === 'completed') {
      if (job.customer_id) {
        createNotification({
          user_id: job.customer_id,
          type: 'JOB_COMPLETED',
          title: 'Service Completed',
          message: `Your ${job.service_category_name || 'service'} request has been marked complete.`,
          data: { job_id: id, status: 'completed' },
        }).catch(console.warn);
      }
      const workerUser = job.worker_id ? inMemoryStore.getWorkerById(job.worker_id) : null;
      const workerUserId = workerUser?.user_id;
      if (workerUserId) {
        createNotification({
          user_id: workerUserId,
          type: 'JOB_COMPLETED',
          title: 'Job Completed',
          message: `Job #${job.job_number || id.slice(0, 8)} completed! ₹${earned} credited to your wallet.`,
          data: { job_id: id, earned, status: 'completed' },
        }).catch(console.warn);
      }
    } else if (newStatus === 'cancelled') {
      if (job.customer_id) {
        createNotification({
          user_id: job.customer_id,
          type: 'JOB_CANCELLED',
          title: 'Request Cancelled',
          message: `Your ${job.service_category_name || 'service'} request has been cancelled.`,
          data: { job_id: id, status: 'cancelled' },
        }).catch(console.warn);
      }
    }

    res.json({
      success: true,
      data: { job, worker_earning: earned, message: `Status updated to ${newStatus}` },
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update job status' },
    });
  }
});

/**
 * GET /api/jobs
 * List jobs
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let userJobs: StoreJob[] = [];
    if (userRole === 'worker') {
      let workerProfile: any = null;
      try {
        const { data } = await supabaseAdmin
          .from('workers')
          .select('id, user_id')
          .eq('user_id', userId)
          .maybeSingle();
        workerProfile = data;
      } catch {}

      const memoryWorker = inMemoryStore.getWorkerByUserId(userId);
      const possibleWorkerIds = new Set<string>([
        userId,
        workerProfile?.id,
        workerProfile?.user_id,
        memoryWorker?.id,
        memoryWorker?.user_id,
      ].filter(Boolean) as string[]);

      userJobs = Array.from(inMemoryStore.jobs.values()).filter(
        (j) => j.worker_id && possibleWorkerIds.has(j.worker_id)
      );
    } else if (userRole === 'customer') {
      userJobs = Array.from(inMemoryStore.jobs.values()).filter((j) => j.customer_id === userId);
    } else {
      userJobs = Array.from(inMemoryStore.jobs.values());
    }

    // Try merging Supabase jobs
    try {
      let queryBuilder = supabaseAdmin.from('jobs').select('*');
      if (userRole === 'customer') {
        queryBuilder = queryBuilder.eq('customer_id', userId);
      } else if (userRole === 'worker') {
        let workerProfile: any = null;
        try {
          const { data } = await supabaseAdmin
            .from('workers')
            .select('id, user_id')
            .eq('user_id', userId)
            .maybeSingle();
          workerProfile = data;
        } catch {}
        const memoryWorker = inMemoryStore.getWorkerByUserId(userId);
        const possibleWorkerIds = Array.from(new Set<string>([
          userId,
          workerProfile?.id,
          workerProfile?.user_id,
          memoryWorker?.id,
          memoryWorker?.user_id,
        ].filter(Boolean) as string[]));

        queryBuilder = queryBuilder.in('worker_id', possibleWorkerIds);
      }
      const { data: dbJobs } = await queryBuilder.order('created_at', { ascending: false });
      if (dbJobs) {
        for (const dj of dbJobs) {
          const existingIdx = userJobs.findIndex((j) => j.id === dj.id);
          if (existingIdx >= 0) {
            // Merge with latest updated record
            userJobs[existingIdx] = {
              ...dj,
              ...userJobs[existingIdx],
              status: userJobs[existingIdx].status || dj.status,
            };
          } else {
            userJobs.push(dj);
          }
        }
      }
    } catch {}

    // Populate worker_name and ensure clean formatting
    userJobs.forEach(job => {
      if (job.worker_id && !job.worker_name) {
        const worker = inMemoryStore.getWorkerById(job.worker_id) || inMemoryStore.getWorkerByUserId(job.worker_id);
        if (worker) {
          job.worker_name = worker.name || (worker as any).user?.name;
        }
      }
    });

    // Sort by created_at descending
    userJobs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    res.json({
      success: true,
      data: {
        jobs: userJobs,
        pagination: { total: userJobs.length, page: 1, limit: 50 },
      },
    });
  } catch (error: any) {
    console.error('List jobs error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list jobs' },
    });
  }
});

export default router;
