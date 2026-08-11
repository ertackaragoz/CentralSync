using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Repositories.Abstract
{
    public interface IProjectRepository
    {
        Task<List<Project>> GetAllProjectsAsync(int page=1,int pageSize=10,ProjectStatus? status=null);
        Task<Project> AddProjectAsync(Project project);

        Task<Project?> GetByIdAsync(Guid id);

        Task<ProjectMember> AddMemberToProjectAsync(ProjectMember member);
        Task<bool> IsUserActiveMemberAsync(Guid projectId, Guid userId);
        Task<Project> UpdateAsync(Project project);
    }
}
