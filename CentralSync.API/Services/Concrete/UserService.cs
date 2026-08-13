using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }
        public async Task<bool> ChangeUserRoleAsync(Guid userId, UserRole newRole)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.Role = newRole;

            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllUsersAsync();

            return users.Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                Department = u.Department,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            }).ToList();
        }

        public async Task<bool> ToggleUserStatusAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.IsActive = !user.IsActive;

            await _userRepository.UpdateAsync(user);
            return true;
        }
    }
}
