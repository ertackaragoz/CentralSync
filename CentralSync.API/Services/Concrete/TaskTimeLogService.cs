using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class TaskTimeLogService : ITaskTimeLogService
    {
        public Task<TaskTimeLogDto> AddTaskTimeLogAsync(Guid taskId, CreateTaskTimeLogRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task<List<TaskTimeLogDto>> GetTaskTimeLogsByTaskIdAsync(Guid taskId)
        {
            throw new NotImplementedException();
        }
    }
}