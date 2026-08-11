using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ITaskRepository
    {
        Task<IEnumerable<ProjectTask>> GetAllTasksAsync(int page=1, int pageSize = 10, Guid? projectId=null, ProjectTaskStatus? status = null, ProjectTaskPriority? priority = null);
        Task<ProjectTask?> GetByIdAsync(Guid taskId);
        Task<ProjectTask> CreateAsync(ProjectTask task);
        Task<ProjectTask> UpdateAsync(ProjectTask task);
    }
}
