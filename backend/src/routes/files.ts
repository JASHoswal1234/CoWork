import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth';

const router = Router();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 5;

// Store files in memory (then upload to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`));
    }
  },
});

/**
 * Upload a file to Supabase Storage and return public URL
 */
async function uploadToSupabase(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * POST /api/files/upload/profile-photo
 * Upload worker/user profile photo
 */
router.post(
  '/upload/profile-photo',
  authenticate,
  upload.single('photo'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided' },
        });
        return;
      }

      const userId = req.user!.id;
      const ext = req.file.originalname.split('.').pop();
      const filePath = `${userId}/profile.${ext}`;

      const publicUrl = await uploadToSupabase(
        'profile-photos',
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // Update user profile photo if worker
      await supabase
        .from('workers')
        .update({ photo_url: publicUrl })
        .eq('user_id', userId);

      res.json({
        success: true,
        data: { url: publicUrl, message: 'Profile photo uploaded successfully' },
      });
    } catch (error: any) {
      console.error('Profile photo upload error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: error.message || 'Upload failed' },
      });
    }
  }
);

/**
 * POST /api/files/upload/job-photo
 * Upload job problem photo
 */
router.post(
  '/upload/job-photo',
  authenticate,
  upload.single('photo'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided' },
        });
        return;
      }

      const { job_id } = req.body;
      const userId = req.user!.id;
      const timestamp = Date.now();
      const ext = req.file.originalname.split('.').pop();
      const filePath = `${job_id || userId}/${timestamp}.${ext}`;

      const publicUrl = await uploadToSupabase(
        'job-images',
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // If job_id provided, append to job's photo array
      if (job_id) {
        const { data: job } = await supabase
          .from('jobs')
          .select('problem_image_urls')
          .eq('id', job_id)
          .single();

        const currentPhotos = job?.problem_image_urls || [];
        await supabase
          .from('jobs')
          .update({ problem_image_urls: [...currentPhotos, publicUrl] })
          .eq('id', job_id);
      }

      res.json({
        success: true,
        data: { url: publicUrl, message: 'Job photo uploaded successfully' },
      });
    } catch (error: any) {
      console.error('Job photo upload error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: error.message || 'Upload failed' },
      });
    }
  }
);

/**
 * POST /api/files/upload/worker-document
 * Upload KYC/certificate document (worker only)
 */
router.post(
  '/upload/worker-document',
  authenticate,
  upload.single('document'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided' },
        });
        return;
      }

      const { document_type, worker_id } = req.body;
      const userId = req.user!.id;

      if (!document_type) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_TYPE', message: 'document_type is required' },
        });
        return;
      }

      const timestamp = Date.now();
      const ext = req.file.originalname.split('.').pop();
      const filePath = `${worker_id || userId}/${document_type}_${timestamp}.${ext}`;

      const publicUrl = await uploadToSupabase(
        'documents',
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // Record in worker_documents table
      if (worker_id) {
        await supabase.from('worker_documents').insert({
          worker_id,
          document_type,
          document_url: publicUrl,
          verification_status: 'pending',
        });
      }

      res.json({
        success: true,
        data: {
          url: publicUrl,
          document_type,
          message: 'Document uploaded. Pending admin verification.',
        },
      });
    } catch (error: any) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: error.message || 'Upload failed' },
      });
    }
  }
);

// Global multer error handler
router.use((error: any, _req: Request, res: Response, _next: any) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      error: { code: 'FILE_TOO_LARGE', message: `File size exceeds ${MAX_SIZE_MB}MB limit` },
    });
    return;
  }
  res.status(400).json({
    success: false,
    error: { code: 'UPLOAD_ERROR', message: error.message },
  });
});

export default router;
