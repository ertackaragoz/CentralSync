using CentralSync.API.Models.Domain;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Repositories.Abstract
{
    public interface IProjectRepository
    {
        Task<Project> AddProjectAsync(Project project);

        Task<Project?> GetByIdAsync(Guid id);

        Task<ProjectMember> AddMemberToProjectAsync(ProjectMember member);

        Task<Project> UpdateAsync(Project project);
    }
}
