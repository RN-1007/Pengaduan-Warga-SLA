import { complaintsRepository } from '../repositories/complaints.repository'
import { CreateComplaintFormData, UpdateComplaintStatusFormData } from '../domain/schemas'
import { ComplaintStatus } from '@/types/database.types'

export const complaintsService = {
  createComplaint(data: CreateComplaintFormData, citizenId: string, photoUrl?: string) {
    // Business logic like calculating SLA manually could be here if not using triggers
    return complaintsRepository.createComplaint(data, citizenId, photoUrl);
  },

  getComplaintsByCitizen(citizenId: string) {
    return complaintsRepository.getComplaints({ citizen_id: citizenId });
  },

  getAllComplaints(filters?: { status?: ComplaintStatus; is_escalated?: boolean }) {
    // Admin, Officer, Supervisor feature
    return complaintsRepository.getComplaints(filters);
  },

  getComplaintDetail(id: string) {
    return complaintsRepository.getComplaintById(id);
  },

  updateStatus(id: string, data: UpdateComplaintStatusFormData) {
    // Business checks e.g. "Only admin can verify", "Only assigned officer can resolve" should be enforced here or via RLS
    return complaintsRepository.updateComplaintStatus(id, data);
  },

  getCategories() {
    return complaintsRepository.getCategories();
  }
}
