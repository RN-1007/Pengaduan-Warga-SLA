import { createClient } from '@/lib/supabase/client'
import { CreateRatingFormData } from '../domain/rating.schema'

export const ratingRepository = {
  async submitRating(complaintId: string, citizenId: string, data: CreateRatingFormData) {
    const supabase = createClient();
    const { data: rating, error } = await supabase
      .from('ratings')
      .insert({
        complaint_id: complaintId,
        citizen_id: citizenId,
        score: data.score,
        feedback: data.feedback
      })
      .select()
      .single();

    if (error) throw error;
    return rating;
  },

  async getRatingByComplaint(complaintId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('complaint_id', complaintId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
