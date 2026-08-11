using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface IUserRepository
    {
        Task<User> AddAsync(User user);
        Task<User> GetByEmailAsync(string email);
    }
}
