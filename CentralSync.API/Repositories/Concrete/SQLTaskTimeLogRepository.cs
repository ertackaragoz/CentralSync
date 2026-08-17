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

        public async Task<List<TaskTimeLog>> GetAllAsync(Guid? userId, Guid? taskId, DateTime? startDate, DateTime? endDate)
        {
            var query = _dbcontext.TaskTimeLogs.Include(t => t.User).AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(t => t.UserId == userId.Value);
            }

            if (taskId.HasValue)
            {
                query = query.Where(t => t.TaskId == taskId.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.WorkDate >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.WorkDate <= endDate.Value.Date);
            }

            return await query.OrderByDescending(t => t.WorkDate).ToListAsync();
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
