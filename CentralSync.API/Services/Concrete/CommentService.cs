using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;
using System.ComponentModel.Design;

namespace CentralSync.API.Services.Concrete
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public CommentService(ICommentRepository commentRepository, ITaskRepository taskRepository, IProjectRepository projectRepository, ICurrentUserService currentUserService)
        {
            _commentRepository = commentRepository;
            _taskRepository = taskRepository;
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
        }

        public async Task<CommentDto> AddCommentAsync(Guid taskId, CreateCommentRequestDto request)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null) throw new KeyNotFoundException("Task not found.");

            var project = await _projectRepository.GetByIdAsync(task.ProjectId);

            if (_currentUserService.Role != UserRole.Admin && project.OwnerId != _currentUserService.UserId)
            {
                var userRoleInProject = await _projectRepository.GetUserRoleInProjectAsync(project.Id, _currentUserService.UserId);

                if (userRoleInProject == null)
                {
                    throw new UnauthorizedAccessException("You must be an active member of this project to comment.");
                }

                if (userRoleInProject == ProjectMemberRole.Viewer)
                {
                    throw new UnauthorizedAccessException("Viewers cannot add comments to tasks.");
                }
            }

            var comment = new Comment
            {
                Content = request.Content,
                TaskId = taskId,
                UserId = _currentUserService.UserId,
                IsDeleted = false
            };

            var createdComment = await _commentRepository.AddAsync(comment);

            return new CommentDto
            {
                Id = createdComment.Id,
                Content = createdComment.Content,
                TaskId = createdComment.TaskId,
                UserId = createdComment.UserId,
                UserName = _currentUserService.FullName,
                CreatedAt = createdComment.CreatedAt
            };
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) return false;

            if (_currentUserService.Role != UserRole.Admin && comment.UserId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("You can only delete your own comments.");
            }

            comment.IsDeleted = true;
            await _commentRepository.UpdateAsync(comment);
            return true;
        }

        public async Task<List<CommentDto>> GetByTaskIdAsync(Guid taskId)
        {
            var comments = await _commentRepository.GetByTaskIdAsync(taskId);
            return comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Content = c.Content,
                TaskId = c.TaskId,
                UserId = c.UserId,
                UserName = $"{c.User.FirstName} {c.User.LastName}",
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();
        }

        public async Task<bool> UpdateCommentAsync(Guid commentId, UpdateCommentRequestDto request)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null) return false;

            if (_currentUserService.Role != UserRole.Admin && comment.UserId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException("You can only edit your own comments.");
            }

            comment.Content = request.Content;

            await _commentRepository.UpdateAsync(comment);
            return true;
        }
    }
}