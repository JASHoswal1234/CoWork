export type NotificationType =
  | 'NEW_SERVICE_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'JOB_ASSIGNED'
  | 'WORKER_ON_THE_WAY'
  | 'JOB_STARTED'
  | 'JOB_COMPLETED'
  | 'JOB_CANCELLED'
  | 'GENERAL';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  data?: {
    job_id?: string;
    domain?: string;
    subcategory?: string;
    estimated_price?: number;
    worker_id?: string;
    worker_name?: string;
    customer_name?: string;
    service?: string;
    earned?: number;
    status?: string;
    distance_km?: number;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
  read_at?: string;
}
