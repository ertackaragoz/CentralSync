using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface ITaskTimeLogService
    {
        Task<TaskTimeLogDto> AddTaskTimeLogAsync(Guid taskId, CreateTaskTimeLogRequestDto request);
        Task<List<TaskTimeLogDto>> GetTaskTimeLogsByTaskIdAsync(Guid taskId);
        Task<List<TaskTimeLogDto>> GetAllTimeLogsAsync(Guid? userId, Guid? taskId, DateTime? startDate, DateTime? endDate);
    }
}
