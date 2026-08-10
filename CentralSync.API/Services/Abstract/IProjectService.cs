using CentralSync.API.Models.DTO;
using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Services.Abstract
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(int page, int pageSize, ProjectStatus? status);
        Task<ProjectDto> CreateProjectAsync(CreateProjectRequestDto request);
        Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);
        Task<ProjectMemberDto> AddMemberToProjectAsync(Guid projectId, AddProjectMemberRequestDto request);
        Task<bool> UpdateProjectAsync(Guid projectId, UpdateProjectRequestDto request);
        Task<bool> ArchiveProjectAsync(Guid projectId, ArchiveProjectRequestDto request);
        Task<bool> DeleteProjectAsync(Guid projectId);
    }
}
