using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ITaskRepository
    {
        Task<IEnumerable<ProjectTask>> GetAllTasksAsync(Guid? projectId, Guid? assignedToUserId, ProjectTaskStatus? status, ProjectTaskPriority? priority, DateTime? dueBefore, DateTime? dueAfter, string? sortBy, string? sortDirection, int page, int pageSize);
        Task<ProjectTask?> GetByIdAsync(Guid taskId);
        Task<ProjectTask> CreateAsync(ProjectTask task);
        Task<ProjectTask> UpdateAsync(ProjectTask task);
    }
}
