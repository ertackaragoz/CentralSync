using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLTaskHistoryRepository : ITaskHistoryRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLTaskHistoryRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public async Task<TaskHistory> AddAsync(TaskHistory taskHistory)
        {
            await _dbcontext.TaskHistories.AddAsync(taskHistory);
            await _dbcontext.SaveChangesAsync();
            return taskHistory;
        }

        public async Task<List<TaskHistory>> GetByTaskIdAsync(Guid taskId)
        {
            return await _dbcontext.TaskHistories
                .Where(th => th.TaskId == taskId)
                .OrderByDescending(th => th.CreatedAt)
                .ToListAsync();
        }
    }
}
