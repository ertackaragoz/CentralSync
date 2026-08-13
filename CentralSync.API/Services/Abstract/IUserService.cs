using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<bool> ToggleUserStatusAsync(Guid userId);
        Task<bool> ChangeUserRoleAsync(Guid userId, UserRole newRole);
    }
}
