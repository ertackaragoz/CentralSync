using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class TaskTimeLogService : ITaskTimeLogService
    {
        private readonly ITaskTimeLogRepository _taskTimeLogRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public TaskTimeLogService(ITaskTimeLogRepository taskTimeLogRepository, ITaskRepository taskRepository, IProjectRepository projectRepository, ICurrentUserService currentUserService)
        {
            _taskTimeLogRepository = taskTimeLogRepository;
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
        }

        public async Task<TaskTimeLogDto> AddTaskTimeLogAsync(Guid taskId, CreateTaskTimeLogRequestDto request)
        {
            if (request.Hours < 0)
            {
                throw new ArgumentException("Task time can't be negative");
            }

            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) { throw new KeyNotFoundException("Task not found"); }

            var project = await _projectRepository.GetByIdAsync(task.ProjectId);

            if (_currentUserService.Role != UserRole.Admin && project.OwnerId != _currentUserService.UserId)
            {
                var userRoleInProject = await _projectRepository.GetUserRoleInProjectAsync(project.Id, _currentUserService.UserId);

                if (userRoleInProject == null)
                {
                    throw new UnauthorizedAccessException("You need to be a member of this project to add time logs.");
                }

                if (userRoleInProject == ProjectMemberRole.Viewer)
                {
                    throw new UnauthorizedAccessException("Viewers can't add time logs.");
                }
            }

            var timeLog = new TaskTimeLog()
            {
                TaskId = taskId,
                UserId = _currentUserService.UserId,
                Hours = request.Hours,
                Description = request.Description,
                WorkDate = request.WorkDate
            };

            await _taskTimeLogRepository.AddAsync(timeLog);

            return new TaskTimeLogDto()
            {
                Id = timeLog.Id,
                TaskId = timeLog.TaskId,
                UserId = _currentUserService.UserId,
                UserFullName = _currentUserService.FullName,
                Hours = request.Hours,
                Description = request.Description,
                WorkDate = request.WorkDate,
                CreatedAt = timeLog.CreatedAt
            };
        }

        public async Task<List<TaskTimeLogDto>> GetAllTimeLogsAsync(Guid? userId, Guid? taskId, DateTime? startDate, DateTime? endDate)
        {
            if (_currentUserService.Role == UserRole.TeamMember)
            {
                userId = _currentUserService.UserId;
            }

            var logs = await _taskTimeLogRepository.GetAllAsync(userId, taskId, startDate, endDate);

            return logs.Select(log => new TaskTimeLogDto
            {
                Id = log.Id,
                TaskId = log.TaskId,
                UserId = log.UserId,
                UserFullName = log.User != null ? $"{log.User.FirstName} {log.User.LastName}" : "Unknown User",
                Hours = log.Hours,
                Description = log.Description,
                WorkDate = log.WorkDate,
                CreatedAt = log.CreatedAt
            }).ToList();
        }

        public async Task<List<TaskTimeLogDto>> GetTaskTimeLogsByTaskIdAsync(Guid taskId)
        {
            var logs = await _taskTimeLogRepository.GetByTaskIdAsync(taskId);

            return logs.Select(log => new TaskTimeLogDto
            {
                Id = log.Id,
                TaskId = log.TaskId,
                UserId = log.UserId,
                UserFullName = log.User != null ? $"{log.User.FirstName} {log.User.LastName}" : "Unknown User",
                Hours = log.Hours,
                Description = log.Description,
                WorkDate = log.WorkDate,
                CreatedAt = log.CreatedAt
            }).ToList();
        }
    }
}