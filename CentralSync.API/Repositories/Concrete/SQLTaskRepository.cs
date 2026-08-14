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
            var query = _dbcontext.Tasks.AsQueryable();

            if (projectId.HasValue) query = query.Where(t => t.ProjectId == projectId.Value);
            if (assignedToUserId.HasValue) query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);
            if (status.HasValue) query = query.Where(t => t.Status == status.Value);
            if (priority.HasValue) query = query.Where(t => t.Priority == priority.Value);
            if (dueBefore.HasValue) query = query.Where(t => t.DueDate <= dueBefore.Value);
            if (dueAfter.HasValue) query = query.Where(t => t.DueDate >= dueAfter.Value);

            if (string.IsNullOrWhiteSpace(sortBy) == false)
            {
                var isDesc = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

                query = sortBy.ToLower() switch
                {
                    "duedate" => isDesc ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
                    "priority" => isDesc ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
                    "createdat" => isDesc ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
                    _ => isDesc ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title)
                };
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedAt);
            }

            var skipAmount = (page - 1) * pageSize;

            return await query.Include(t => t.AssignedToUser).Skip(skipAmount).Take(pageSize).ToListAsync();
        }

        public async Task<ProjectTask?> GetByIdAsync(Guid taskId)
        {
            return await _dbcontext.Tasks.Include(t => t.AssignedToUser).FirstOrDefaultAsync(t => t.Id == taskId);
        }

        public async Task<ProjectTask> UpdateAsync(ProjectTask task)
        {
            await _dbcontext.SaveChangesAsync();
            return task;
        }
    }
}
