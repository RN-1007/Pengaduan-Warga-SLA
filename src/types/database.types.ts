// File: src/types/database.types.ts

// ENUMS
export type UserRole = 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SUPERVISOR';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
export type ComplaintStatus = 'SUBMITTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

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
}