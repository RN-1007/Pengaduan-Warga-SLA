import { ratingRepository } from '../repositories/rating.repository'
import { CreateRatingFormData } from '../domain/rating.schema'

export const ratingService = {
  submitRating(complaintId: string, citizenId: string, data: CreateRatingFormData) {
    return ratingRepository.submitRating(complaintId, citizenId, data);
  },
  
  getRating(complaintId: string) {
    return ratingRepository.getRatingByComplaint(complaintId);
  }
}
