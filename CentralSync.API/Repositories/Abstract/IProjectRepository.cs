using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Repositories.Abstract
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetAllProjectsAsync(int page = 1, int pageSize = 10, ProjectStatus? status = null, Guid? currentUserId = null, bool isAdmin = false);
        Task<Project> AddProjectAsync(Project project);
        Task<List<ProjectMember>> GetProjectMembersAsync(Guid id, ProjectMemberRole? role);
        Task<Project?> GetByIdAsync(Guid id);
        Task<ProjectMember> AddMemberToProjectAsync(ProjectMember member);
        Task<ProjectMemberRole?> GetUserRoleInProjectAsync(Guid projectId, Guid userId);
        Task<bool> IsUserActiveMemberAsync(Guid projectId, Guid userId);
        Task<Project> UpdateAsync(Project project);
    }
}
