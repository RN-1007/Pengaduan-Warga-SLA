import { adminUsersRepository } from '../repositories/admin-users.repository';

export const adminUsersService = {
  getAllUsers: () => adminUsersRepository.getAllUsers(),
  updateUserRole: (userId: string, role: string) => adminUsersRepository.updateUserRole(userId, role),
  deleteUser: (userId: string) => adminUsersRepository.deleteUser(userId)
}
