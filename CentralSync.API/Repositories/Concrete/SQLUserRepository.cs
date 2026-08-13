using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLUserRepository : IUserRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLUserRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        public async Task<User> AddAsync(User user)
        {
            await _dbcontext.Users.AddAsync(user);
            await _dbcontext.SaveChangesAsync();
            return user;
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _dbcontext.Users.ToListAsync();
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _dbcontext.Users.FirstOrDefaultAsync(th => th.Email == email);
        }

        public async Task<User> GetByIdAsync(Guid id)
        {
            return await _dbcontext.Users.FindAsync(id);
        }

        public async Task<User> UpdateAsync(User user)
        {
            await _dbcontext.SaveChangesAsync();
            return user;
        }
    }
}
