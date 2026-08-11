using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAllTasksAsync(Guid? projectId, Guid? assignedToUserId, ProjectTaskStatus? status, ProjectTaskPriority? priority, DateTime? dueBefore, DateTime? dueAfter, string? sortBy, string? sortDirection, int page, int pageSize);
        Task<TaskDto?> GetTaskByIdAsync(Guid taskId);
        Task<TaskDto> CreateTaskAsync(CreateTaskRequestDto request);
        Task<bool> UpdateTaskAsync(Guid taskId, UpdateTaskRequestDto request);
        Task<bool> DeleteTaskAsync(Guid taskId);
        Task<bool> UpdateTaskStatusAsync(Guid taskId, TaskStatus status);
    }
}
