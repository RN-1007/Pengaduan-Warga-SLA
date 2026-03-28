import { authRepository } from '../repositories/auth.repository'
import { LoginFormData, RegisterFormData } from '../domain/schemas'

export const authService = {
  async login(data: LoginFormData) {
    return await authRepository.login(data);
  },

  async register(data: RegisterFormData) {
    return await authRepository.register(data);
  },

  async logout() {
    return await authRepository.logout();
  },

  async getSession() {
    return await authRepository.getSession();
  },
  
  async getCurrentUser() {
    return await authRepository.getCurrentUser();
  }
}
