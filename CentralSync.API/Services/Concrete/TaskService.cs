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
        private readonly ITaskHistoryRepository _taskHistoryRepository;
        private readonly ITaskTimeLogRepository _taskTimeLogRepository;
        private readonly ICurrentUserService _currentUserService;

        public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository, ITaskHistoryRepository taskHistoryRepository, ITaskTimeLogRepository taskTimeLogRepository, ICurrentUserService currentUserService)
        {
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _taskHistoryRepository = taskHistoryRepository;
            _taskTimeLogRepository = taskTimeLogRepository;
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
                var assignedUserRole = await _projectRepository.GetUserRoleInProjectAsync(request.ProjectId, request.AssignedToUserId.Value);

                if (assignedUserRole == null)
                {
                    throw new InvalidOperationException("The assigned user must be an active member of the project.");
                }
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
                AssignedToUserFirstName = t.AssignedToUser?.FirstName,
                AssignedToUserLastName = t.AssignedToUser?.LastName,
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

            var timeLogs = await _taskTimeLogRepository.GetByTaskIdAsync(taskId);

            var totalActualHours = timeLogs.Sum(log => log.Hours);

            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                ProjectId = task.ProjectId,
                AssignedToUserId = task.AssignedToUserId,
                AssignedToUserFirstName = task.AssignedToUser?.FirstName,
                AssignedToUserLastName = task.AssignedToUser?.LastName,
                CreatedByUserId = task.CreatedByUserId,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                EstimatedHours = task.EstimatedHours,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                CompletedAt = task.CompletedAt,
                ActualHours = totalActualHours
            };
        }

        public async Task<bool> UpdateTaskAsync(Guid taskId, UpdateTaskRequestDto request)
        {
            if (request.EstimatedHours < 0) throw new ArgumentException("Estimated hours cannot be negative.");

            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) return false;

            var project = await _projectRepository.GetByIdAsync(task.ProjectId);
            if (project == null) return false;

            if (project.OwnerId != _currentUserService.UserId)
            {
                var userRoleInProject = await _projectRepository.GetUserRoleInProjectAsync(project.Id, _currentUserService.UserId);

                if (userRoleInProject == null)
                {
                    throw new UnauthorizedAccessException("You must be an active member of this project to update tasks.");
                }

                if (userRoleInProject == ProjectMemberRole.Viewer)
                {
                    throw new UnauthorizedAccessException("Viewers cannot update tasks.");
                }
            }

            if (request.DueDate.HasValue && request.DueDate.Value.Date < project.StartDate.Date)
            {
                throw new ArgumentException("Due date cannot be before the project start date.");
            }

            if (request.AssignedToUserId.HasValue && request.AssignedToUserId != task.AssignedToUserId)
            {
                var assignedUserRole = await _projectRepository.GetUserRoleInProjectAsync(task.ProjectId, request.AssignedToUserId.Value);

                if (assignedUserRole == null)
                {
                    throw new InvalidOperationException("The assigned user must be an active member of the project.");
                }
            }

            var historyRecords = new List<TaskHistory>();

            if (task.Title != request.Title)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.TitleChanged, task.Title, request.Title));
            }

            if (task.Description != request.Description)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.DescriptionChanged, task.Description, request.Description));
            }

            if (task.AssignedToUserId != request.AssignedToUserId)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.AssignedUserChanged, task.AssignedToUserId?.ToString(), request.AssignedToUserId?.ToString()));
            }

            if (task.Priority != request.Priority)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.PriorityChanged, task.Priority.ToString(), request.Priority.ToString()));
            }

            if (task.DueDate != request.DueDate)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.DueDateChanged, task.DueDate?.ToString("yyyy-MM-dd"), request.DueDate?.ToString("yyyy-MM-dd")));
            }

            if (task.EstimatedHours != request.EstimatedHours)
            {
                historyRecords.Add(CreateHistoryRecord(task.Id, TaskHistoryChangeType.EstimatedHoursChanged, task.EstimatedHours?.ToString(), request.EstimatedHours?.ToString()));
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.AssignedToUserId = request.AssignedToUserId;
            task.Priority = request.Priority;
            task.DueDate = request.DueDate;
            task.EstimatedHours = request.EstimatedHours;

            await _taskRepository.UpdateAsync(task);

            foreach (var record in historyRecords)
            {
                await _taskHistoryRepository.AddAsync(record);
            }

            return true;
        }

        private TaskHistory CreateHistoryRecord(Guid taskId, TaskHistoryChangeType changeType, string? oldValue, string? newValue)
        {
            return new TaskHistory
            {
                TaskId = taskId,
                ChangedByUserId = _currentUserService.UserId,
                ChangeType = changeType,
                OldValue = oldValue,
                NewValue = newValue,
                Description = $"{changeType} modified.",
                CreatedAt = DateTime.UtcNow
            };
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

            var oldStatus = task.Status.ToString();

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

            if (oldStatus != status.ToString())
            {
                var historyRecord = new TaskHistory
                {
                    TaskId = task.Id,
                    ChangedByUserId = _currentUserService.UserId,
                    ChangeType = TaskHistoryChangeType.StatusChanged,
                    OldValue = oldStatus,
                    NewValue = status.ToString(),
                    Description = $"Task status changed from {oldStatus} to {status}",
                    CreatedAt = DateTime.UtcNow
                };

                await _taskHistoryRepository.AddAsync(historyRecord);
            }

            return true;
        }
        public async Task<List<TaskHistoryDto>> GetTaskHistoriesAsync(Guid taskId)
        {
            var histories = await _taskHistoryRepository.GetByTaskIdAsync(taskId);

            return histories.Select(h => new TaskHistoryDto
            {
                Id = h.Id,
                TaskId = h.TaskId,
                ChangedByUserId = h.ChangedByUserId,
                ChangeType = h.ChangeType,
                OldValue = h.OldValue,
                NewValue = h.NewValue,
                Description = h.Description,
                CreatedAt = h.CreatedAt
            }).ToList();
        }
    }
}
