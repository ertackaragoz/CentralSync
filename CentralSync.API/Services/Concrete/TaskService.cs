using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class TaskService : ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository, ICurrentUserService currentUserService)
        {
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
        }
        public Task<TaskDto> CreateTaskAsync(CreateTaskRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteTaskAsync(Guid taskId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<TaskDto>> GetAllTasksAsync(Guid? projectId, Guid? assignedToUserId, ProjectTaskStatus? status, ProjectTaskPriority? priority, DateTime? dueBefore, DateTime? dueAfter, string? sortBy, string? sortDirection, int page, int pageSize)
        {
            throw new NotImplementedException();
        }

        public Task<TaskDto?> GetTaskByIdAsync(Guid taskId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateTaskAsync(Guid taskId, UpdateTaskRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateTaskStatusAsync(Guid taskId, ProjectTaskStatus status)
        {
            throw new NotImplementedException();
        }
    }
}
