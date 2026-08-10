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

        public ProjectService(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(int page, int pageSize, ProjectStatus? status)
        {
            var projectsDomain = await _projectRepository.GetAllProjectsAsync(page, pageSize, status);

            var projectsDto = new List<ProjectDto>();

            foreach (var projectDomain in projectsDomain)
            {
                projectsDto.Add(new ProjectDto()
                {
                    Id = projectDomain.Id,
                    Name = projectDomain.Name,
                    Description = projectDomain.Description,
                    StartDate = projectDomain.StartDate,
                    Status = projectDomain.Status,
                    ArchivedAt = projectDomain.ArchivedAt,
                    CreatedAt = projectDomain.CreatedAt,
                    IsArchived = projectDomain.IsArchived,
                    UpdatedAt = projectDomain.UpdatedAt,
                    EndDate = projectDomain.EndDate,
                    OwnerId = projectDomain.OwnerId
                });
            }
            return projectsDto;
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return null; }

            return new ProjectDto()
            {
                Id = projectDomainModel.Id,
                Name = projectDomainModel.Name,
                Description = projectDomainModel.Description,
                StartDate = projectDomainModel.StartDate,
                EndDate = projectDomainModel.EndDate,
                Status = projectDomainModel.Status,
                ArchivedAt = projectDomainModel.ArchivedAt,
                CreatedAt = projectDomainModel.CreatedAt,
                IsArchived = projectDomainModel.IsArchived,
                OwnerId = projectDomainModel.OwnerId,
                UpdatedAt = projectDomainModel.UpdatedAt,
            };
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectRequestDto request, Guid userId)
        {
            if (DateTime.UtcNow > request.StartDate)
            {
                throw new ArgumentException("Start date can't be in the past");
            }

            if (request.EndDate != null && DateTime.UtcNow > request.EndDate)
            {
                throw new ArgumentException("End date can't be in the past");
            }

            if (request.EndDate < request.StartDate)
            {
                throw new ArgumentException("The end date cannot be set before the start date.");
            }

            var projectDomainModel = new Project()
            {
                Name = request.Name,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                OwnerId = userId,
                IsArchived = false,
                IsDeleted = false,
            };

            await _projectRepository.AddProjectAsync(projectDomainModel);

            return new ProjectDto()
            {
                Id = projectDomainModel.Id,
                Name = projectDomainModel.Name,
                Description = projectDomainModel.Description,
                StartDate = projectDomainModel.StartDate,
                EndDate = projectDomainModel.EndDate,
                Status = projectDomainModel.Status,
                OwnerId = projectDomainModel.OwnerId,
                IsArchived = projectDomainModel.IsArchived,
                ArchivedAt = projectDomainModel.ArchivedAt,
                CreatedAt = projectDomainModel.CreatedAt,
                UpdatedAt = projectDomainModel.UpdatedAt,
            };
        }

        public async Task<ProjectMemberDto> AddMemberToProjectAsync(Guid projectId, AddProjectMemberRequestDto request)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { throw new KeyNotFoundException("Project not found"); }
            if (projectDomainModel.IsArchived) { throw new InvalidOperationException("Can't add member to archived project."); }

            var projectMemberDomain = new ProjectMember()
            {
                ProjectId = projectId,
                UserId = request.UserId,
                Role = request.Role,
                IsActive = true
            };

            await _projectRepository.AddMemberToProjectAsync(projectMemberDomain);

            return new ProjectMemberDto()
            {
                Id = projectMemberDomain.Id,
                ProjectId = projectMemberDomain.ProjectId,
                UserId = projectMemberDomain.UserId,
                Role = projectMemberDomain.Role,
                IsActive = projectMemberDomain.IsActive,
                JoinedAt = projectMemberDomain.JoinedAt
            };
        }

        public async Task<bool> UpdateProjectAsync(Guid projectId, UpdateProjectRequestDto request)
        {
            if (DateTime.UtcNow > request.StartDate)
            {
                throw new ArgumentException("Start date can't be in the past");
            }

            if (request.EndDate != null && DateTime.UtcNow > request.EndDate)
            {
                throw new ArgumentException("End date can't be in the past");
            }

            if (request.EndDate < request.StartDate)
            {
                throw new ArgumentException("The end date cannot be set before the start date.");
            }

            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return false; }
            if (projectDomainModel.IsArchived) { throw new InvalidOperationException("Archived projects can't be updated"); }

            projectDomainModel.Name = request.Name;
            projectDomainModel.Description = request.Description;
            projectDomainModel.StartDate = request.StartDate;
            projectDomainModel.EndDate = request.EndDate;

            await _projectRepository.UpdateAsync(projectDomainModel);
            return true;
        }

        public async Task<bool> ArchiveProjectAsync(Guid projectId, ArchiveProjectRequestDto request)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) return false;

            projectDomainModel.IsArchived = request.IsArchived;
            projectDomainModel.ArchivedAt = request.IsArchived ? DateTime.UtcNow : null;

            await _projectRepository.UpdateAsync(projectDomainModel);
            return true;
        }

        public async Task<bool> DeleteProjectAsync(Guid projectId)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return false; }

            projectDomainModel.IsDeleted = true;

            await _projectRepository.UpdateAsync(projectDomainModel);
            return true;
        }

    }
}
