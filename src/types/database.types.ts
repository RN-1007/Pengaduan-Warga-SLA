// File: src/types/database.types.ts

// ENUMS
export type UserRole = 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SUPERVISOR';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type ComplaintStatus = 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';

export const SLA_RESOLUTION_HOURS: Record<ComplaintPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  EMERGENCY: 6
};

// ENTITIES
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  citizen_id: string;
  category_id: string;
  title: string;
  description: string;
  location: string;
  photo_url?: string;
  priority?: ComplaintPriority;
  status: ComplaintStatus;
  sla_deadline?: string;
  is_escalated: boolean;
  created_at: string;
  updated_at: string;
  // relations
  complaint_categories?: ComplaintCategory;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  officer_id: string;
  assigned_by: string;
  assigned_at: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  officer_id: string;
  status: ComplaintStatus;
  notes: string;
  photo_url?: string;
  created_at: string;
}

export interface Rating {
  id: string;
  complaint_id: string;
  citizen_id: string;
  score: number;
  feedback?: string;
  created_at: string;
}

export interface SlaRule {
  id: string;
  category_id: string;
  priority: ComplaintPriority;
  resolution_time_hours: number;
  created_at: string;
}

export interface EscalationLog {
  id: string;
  complaint_id: string;
  reason: string;
  escalated_at: string;
}