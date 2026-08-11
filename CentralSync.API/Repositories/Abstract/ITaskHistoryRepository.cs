using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ITaskHistoryRepository
    {
        Task<TaskHistory> AddAsync(TaskHistory taskHistory);
        Task<List<TaskHistory>> GetByTaskIdAsync(Guid taskId);
    }
}
