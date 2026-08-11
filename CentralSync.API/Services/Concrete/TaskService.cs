using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;
using System.Threading.Tasks;

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
        public async Task<TaskDto> CreateTaskAsync(CreateTaskRequestDto request)
        {
            if (request.EstimatedHours < 0) throw new ArgumentException("Estimated hours cannot be negative.");

            var project = await _projectRepository.GetByIdAsync(request.ProjectId);
            if (project == null) throw new KeyNotFoundException("Project not found.");

            if (_currentUserService.Role != UserRole.Admin && project.OwnerId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("Only the project owner or an admin can create tasks for this project.");
            }

            if (request.DueDate.HasValue && request.DueDate.Value.Date < project.StartDate.Date)
            {
                throw new ArgumentException("Due date cannot be before the project start date.");
            }

            if (request.AssignedToUserId.HasValue)
            {
                bool isMember = await _projectRepository.IsUserActiveMemberAsync(request.ProjectId, request.AssignedToUserId.Value);
                if (!isMember) throw new InvalidOperationException("The assigned user must be an active member of the project.");
            }

            var task = new ProjectTask
            {
                Title = request.Title,
                Description = request.Description,
                ProjectId = request.ProjectId,
                AssignedToUserId = request.AssignedToUserId,
                CreatedByUserId = _currentUserService.UserId,
                Priority = request.Priority,
                Status = ProjectTaskStatus.Todo,
                DueDate = request.DueDate,
                EstimatedHours = request.EstimatedHours,
                IsDeleted = false
            };

            await _taskRepository.CreateAsync(task);

            return await GetTaskByIdAsync(task.Id);
        }

        public async Task<bool> DeleteTaskAsync(Guid taskId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) return false;

            var project = await _projectRepository.GetByIdAsync(task.ProjectId);

            if (_currentUserService.Role != UserRole.Admin && project?.OwnerId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("Only the project owner or an admin can delete this task.");
            }

            task.IsDeleted = true;
            await _taskRepository.UpdateAsync(task);
            return true;
        }

        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(Guid? projectId, Guid? assignedToUserId, ProjectTaskStatus? status, ProjectTaskPriority? priority, DateTime? dueBefore, DateTime? dueAfter, string? sortBy, string? sortDirection, int page, int pageSize)
        {
            pageSize = pageSize > 50 ? 50 : pageSize;

            var tasks = await _taskRepository.GetAllTasksAsync(projectId, assignedToUserId, status, priority, dueBefore, dueAfter, sortBy, sortDirection, page, pageSize);

            return tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,    
                Description = t.Description,
                ProjectId = t.ProjectId,
                AssignedToUserId = t.AssignedToUserId,
                CreatedByUserId = t.CreatedByUserId,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                EstimatedHours = t.EstimatedHours,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt
            });
        }

        public async Task<TaskDto?> GetTaskByIdAsync(Guid taskId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) return null;

            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                ProjectId = task.ProjectId,
                AssignedToUserId = task.AssignedToUserId,
                CreatedByUserId = task.CreatedByUserId,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                EstimatedHours = task.EstimatedHours,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                CompletedAt = task.CompletedAt
            };
        }

        public async Task<bool> UpdateTaskAsync(Guid taskId, UpdateTaskRequestDto request)
        {
            if (request.EstimatedHours < 0) throw new ArgumentException("Estimated hours cannot be negative.");

            var taskDomainModel = await _taskRepository.GetByIdAsync(taskId);
            if (taskDomainModel == null) { return false; }

            var projectDomainModel = await _projectRepository.GetByIdAsync(taskDomainModel.ProjectId);
            if (projectDomainModel == null) { return false;}

            if (_currentUserService.Role != UserRole.Admin && projectDomainModel.OwnerId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("Only the project owner or an admin can update this task.");
            }

            if (request.DueDate.HasValue && request.DueDate.Value.Date < projectDomainModel.StartDate.Date)
            {
                throw new ArgumentException("Due date cannot be before the project start date.");
            }

            if (request.AssignedToUserId.HasValue)
            {
                bool isMember = await _projectRepository.IsUserActiveMemberAsync(taskDomainModel.ProjectId, request.AssignedToUserId.Value);
                if (!isMember) throw new InvalidOperationException("The assigned user must be an active member of the project.");
            }

            taskDomainModel.Title = request.Title;
            taskDomainModel.Description = request.Description;
            taskDomainModel.AssignedToUserId = request.AssignedToUserId;
            taskDomainModel.Priority = request.Priority;
            taskDomainModel.DueDate = request.DueDate;
            taskDomainModel.EstimatedHours = request.EstimatedHours;

            await _taskRepository.UpdateAsync(taskDomainModel);

            return true;
        }

        public async Task<bool> UpdateTaskStatusAsync(Guid taskId, ProjectTaskStatus status)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) return false;

            var project = await _projectRepository.GetByIdAsync(task.ProjectId);
            if (project == null) return false;

            if (_currentUserService.Role != UserRole.Admin &&
                project.OwnerId != _currentUserService.UserId &&
                task.AssignedToUserId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("You do not have permission to change the status of this task.");
            }

            task.Status = status;

            if (status == ProjectTaskStatus.Done)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                task.CompletedAt = null;
            }

            await _taskRepository.UpdateAsync(task);
            return true;
        }
    }
}
