using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ITaskTimeLogRepository
    {
        Task<TaskTimeLog> AddAsync(TaskTimeLog taskTimeLog);
        Task<List<TaskTimeLog>> GetByTaskIdAsync(Guid taskId);
    }
}
