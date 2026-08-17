using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

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

        public async Task<List<TaskTimeLog>> GetAllAsync(Guid? userId, Guid? taskId, DateTime? startDate, DateTime? endDate, Guid currentUserId, bool isAdmin)
        {
            var query = _dbcontext.TaskTimeLogs
                .Include(log => log.User)
                .Include(log => log.Task)
                .AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(log =>
                    _dbcontext.Projects.Any(project =>
                        project.Id == log.Task.ProjectId &&
                        (project.OwnerId == currentUserId ||
                         _dbcontext.ProjectMembers.Any(member =>
                             member.ProjectId == project.Id &&
                             member.UserId == currentUserId &&
                             member.IsActive))));
            }

            if (userId.HasValue) query = query.Where(log => log.UserId == userId.Value);
            if (taskId.HasValue) query = query.Where(log => log.TaskId == taskId.Value);
            if (startDate.HasValue) query = query.Where(log => log.WorkDate >= startDate.Value.Date);
            if (endDate.HasValue) query = query.Where(log => log.WorkDate <= endDate.Value.Date);

            return await query.OrderByDescending(log => log.WorkDate).ToListAsync();
        }

        public async Task<List<TaskTimeLog>> GetByTaskIdAsync(Guid taskId)
        {
            return await _dbcontext.TaskTimeLogs
                .Include(log => log.User)
                .Where(log => log.TaskId == taskId)
                .OrderByDescending(log => log.CreatedAt)
                .ToListAsync();
        }
    }
}
