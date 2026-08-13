using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface ITaskTimeLogService
    {
        Task<TaskTimeLogDto> AddTaskTimeLogAsync(Guid taskId, CreateTaskTimeLogRequestDto request);
        Task<IEnumerable<TaskTimeLogDto>> GetTaskTimeLogsByTaskIdAsync(Guid taskId);
    }
}
