// File: src/hooks/use-complaints.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { complaintRepository } from '@/repositories/supabase/complaint.repository';
import type { CreateComplaintInput } from '@/modules/complaints/validations';

export function useActiveCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => complaintRepository.getActiveCategories(),
  });
}

export function useCreateComplaint() {
  return useMutation({
    mutationFn: ({ payload, userId }: { payload: CreateComplaintInput, userId: string }) =>
      complaintRepository.createComplaint(payload, userId),
  });
}