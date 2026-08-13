using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface IUserRepository
    {
        Task<User> AddAsync(User user);
        Task<User> GetByEmailAsync(string email);
        Task<List<User>> GetAllUsersAsync();
        Task<User> GetByIdAsync(Guid id);
        Task<User> UpdateAsync(User user);
    }
}
