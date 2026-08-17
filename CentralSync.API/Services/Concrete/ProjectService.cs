using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserService _currentUserService;

        public ProjectService(
            IProjectRepository projectRepository,
            IUserRepository userRepository,
            ICurrentUserService currentUserService)
        {
            _projectRepository = projectRepository;
            _userRepository = userRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(
            int page,
            int pageSize,
            ProjectStatus? status)
        {
            var projectsDomain = await _projectRepository.GetAllProjectsAsync(
                page,
                pageSize,
                status,
                _currentUserService.UserId,
                _currentUserService.Role == UserRole.Admin);

            return projectsDomain.Select(MapProject).ToList();
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                return null;

            await EnsureProjectReadableAsync(project);

            return MapProject(project);
        }

        public async Task<ProjectDto> CreateProjectAsync(
            CreateProjectRequestDto request)
        {
            if (request.EndDate != null &&
                DateTime.UtcNow.Date > request.EndDate.Value.Date)
            {
                throw new ArgumentException(
                    "End date can't be a day in the past");
            }

            if (request.EndDate < request.StartDate)
            {
                throw new ArgumentException(
                    "The end date cannot be set before the start date.");
            }

            var project = new Project
            {
                Name = request.Name,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                OwnerId = _currentUserService.UserId,
                IsArchived = false,
                IsDeleted = false
            };

            await _projectRepository.AddProjectAsync(project);

            return MapProject(project);
        }

        public async Task<ProjectMemberDto> AddMemberToProjectAsync(
            Guid projectId,
            AddProjectMemberRequestDto request)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                throw new KeyNotFoundException("Project not found");

            if (project.IsArchived)
                throw new InvalidOperationException(
                    "Can't add member to archived project.");

            if (_currentUserService.Role != UserRole.Admin &&
                project.OwnerId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException(
                    "Only the project owner or an admin can manage project members.");
            }

            var user = await _userRepository.GetByIdAsync(request.UserId);

            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (!user.IsActive)
                throw new InvalidOperationException(
                    "Inactive users can't be added to projects.");

            var existingRole =
                await _projectRepository.GetUserRoleInProjectAsync(
                    projectId,
                    request.UserId);

            if (existingRole.HasValue)
            {
                throw new InvalidOperationException(
                    "This user is already an active member of the project.");
            }

            var projectRole = user.Role == UserRole.Viewer
                ? ProjectMemberRole.Viewer
                : request.Role;

            var member = new ProjectMember
            {
                ProjectId = projectId,
                UserId = request.UserId,
                Role = projectRole,
                IsActive = true
            };

            await _projectRepository.AddMemberToProjectAsync(member);

            return new ProjectMemberDto
            {
                Id = member.Id,
                ProjectId = member.ProjectId,
                UserId = member.UserId,
                Role = member.Role,
                IsActive = member.IsActive,
                JoinedAt = member.JoinedAt
            };
        }

        public async Task<bool> UpdateProjectAsync(
            Guid projectId,
            UpdateProjectRequestDto request)
        {
            if (request.EndDate < request.StartDate)
            {
                throw new ArgumentException(
                    "The end date cannot be set before the start date.");
            }

            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                return false;

            if (project.IsArchived)
                throw new InvalidOperationException(
                    "Archived projects can't be updated");

            EnsureProjectOwnerOrAdmin(project);

            project.Name = request.Name;
            project.Description = request.Description;
            project.StartDate = request.StartDate;
            project.EndDate = request.EndDate;

            await _projectRepository.UpdateAsync(project);

            return true;
        }

        public async Task<bool> ArchiveProjectAsync(
            Guid projectId,
            ArchiveProjectRequestDto request)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                return false;

            EnsureProjectOwnerOrAdmin(project);

            project.IsArchived = request.IsArchived;
            project.ArchivedAt = request.IsArchived
                ? DateTime.UtcNow
                : null;

            await _projectRepository.UpdateAsync(project);

            return true;
        }

        public async Task<bool> DeleteProjectAsync(Guid projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);

            if (project == null)
                return false;

            EnsureProjectOwnerOrAdmin(project);

            project.IsDeleted = true;

            await _projectRepository.UpdateAsync(project);

            return true;
        }

        public async Task<List<ProjectMemberDto>> GetProjectMembersAsync(
            Guid id,
            ProjectMemberRole? role)
        {
            var project = await _projectRepository.GetByIdAsync(id);

            if (project == null)
                return null;

            await EnsureProjectReadableAsync(project);

            var members =
                await _projectRepository.GetProjectMembersAsync(id, role);

            if (members == null)
                return null;

            return members.Select(pm => new ProjectMemberDto
            {
                Id = pm.Id,
                ProjectId = pm.ProjectId,
                UserId = pm.UserId,
                FirstName = pm.User.FirstName,
                LastName = pm.User.LastName,
                Role = pm.Role,
                JoinedAt = pm.JoinedAt,
                IsActive = pm.IsActive
            }).ToList();
        }

        private async Task EnsureProjectReadableAsync(Project project)
        {
            if (_currentUserService.Role == UserRole.Admin)
                return;

            if (project.OwnerId == _currentUserService.UserId)
                return;

            var isMember =
                await _projectRepository.IsUserActiveMemberAsync(
                    project.Id,
                    _currentUserService.UserId);

            if (!isMember)
            {
                throw new UnauthorizedAccessException(
                    "You must be an active member of this project.");
            }
        }

        private void EnsureProjectOwnerOrAdmin(Project project)
        {
            if (_currentUserService.Role != UserRole.Admin &&
                project.OwnerId != _currentUserService.UserId)
            {
                throw new UnauthorizedAccessException(
                    "Only the project owner or an admin can manage this project.");
            }
        }

        private static ProjectDto MapProject(Project project)
        {
            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status,
                ArchivedAt = project.ArchivedAt,
                CreatedAt = project.CreatedAt,
                IsArchived = project.IsArchived,
                OwnerId = project.OwnerId,
                UpdatedAt = project.UpdatedAt
            };
        }
    }
}