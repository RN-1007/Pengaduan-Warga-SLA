import { adminRepository } from '../repositories/admin.repository'
import { CreateCategoryFormData } from '../domain/schemas'

export const adminService = {
  getCategories() {
    return adminRepository.getCategoriesWithSla();
  },

  createCategory(data: CreateCategoryFormData) {
    return adminRepository.createCategory(data);
  },

  toggleCategory(id: string, isActive: boolean) {
    return adminRepository.toggleCategoryStatus(id, isActive);
  }
}
