using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLTaskHistoryRepository : ITaskHistoryRepository
    {
        public Task<TaskHistory> AddAsync(TaskHistory taskHistory)
        {
            throw new NotImplementedException();
        }

        public Task<List<TaskHistory>> GetByTaskIdAsync(Guid taskId)
        {
            throw new NotImplementedException();
        }
    }
}
