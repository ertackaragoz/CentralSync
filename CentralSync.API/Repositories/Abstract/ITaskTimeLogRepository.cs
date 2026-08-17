using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ITaskTimeLogRepository
    {
        Task<TaskTimeLog> AddAsync(TaskTimeLog taskTimeLog);
        Task<List<TaskTimeLog>> GetByTaskIdAsync(Guid taskId);
        Task<List<TaskTimeLog>> GetAllAsync(Guid? userId, Guid? taskId, DateTime? startDate, DateTime? endDate, Guid currentUserId, bool isAdmin);
    }
}
