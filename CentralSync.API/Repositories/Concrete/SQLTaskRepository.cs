using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLTaskRepository : ITaskRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLTaskRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public async Task<ProjectTask> CreateAsync(ProjectTask task)
        {
            await _dbcontext.Tasks.AddAsync(task);
            await _dbcontext.SaveChangesAsync();
            return task;
        }

        public async Task<IEnumerable<ProjectTask>> GetAllTasksAsync(Guid? projectId, Guid? assignedToUserId, ProjectTaskStatus? status, ProjectTaskPriority? priority, DateTime? dueBefore, DateTime? dueAfter, string? sortBy, string? sortDirection, int page, int pageSize)
        {
            var tasks = _dbcontext.Tasks.AsQueryable();

            if (projectId.HasValue)
            {
                tasks = tasks.Where(x => x.Id == projectId.Value);
            }

            if (status.HasValue)
            {
                tasks = tasks.Where(x => x.Status == status.Value);
            }

            if (priority.HasValue)
            {
                tasks = tasks.Where(x => x.Priority == priority.Value);
            }

            var skipAmount = (page - 1) * pageSize;

            return await tasks.Skip(skipAmount).Take(pageSize).ToListAsync();
        }

        public async Task<ProjectTask?> GetByIdAsync(Guid taskId)
        {
            return await _dbcontext.Tasks.FindAsync(taskId);
        }

        public async Task<ProjectTask> UpdateAsync(ProjectTask task)
        {
            await _dbcontext.SaveChangesAsync();
            return task;
        }
    }
}
