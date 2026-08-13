using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLTaskTimeLogRepository : ITaskTimeLogRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLTaskTimeLogRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public async Task<TaskTimeLog> AddAsync(TaskTimeLog taskTimeLog)
        {
            await _dbcontext.TaskTimeLogs.AddAsync(taskTimeLog);
            await _dbcontext.SaveChangesAsync();
            return taskTimeLog;
        }

        public async Task<List<TaskTimeLog>> GetByTaskIdAsync(Guid taskId)
        {
            return await _dbcontext.TaskTimeLogs
                .Include(t => t.User)
                .Where(t => t.TaskId == taskId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}
