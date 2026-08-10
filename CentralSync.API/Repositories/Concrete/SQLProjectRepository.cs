using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLProjectRepository : IProjectRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLProjectRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public async Task<ProjectMember> AddMemberToProjectAsync(ProjectMember member)
        {
            await _dbcontext.ProjectMembers.AddAsync(member);
            await _dbcontext.SaveChangesAsync();
            return member;
        }

        public async Task<Project> AddProjectAsync(Project project)
        {
            await _dbcontext.Projects.AddAsync(project);
            await _dbcontext.SaveChangesAsync();
            return project;
        }

        public async Task<List<Project>> GetAllProjectsAsync(int page = 1, int pageSize = 10, ProjectStatus? status = null)
        {
            var projects = _dbcontext.Projects.AsQueryable();

            if (status.HasValue)
            {
                projects = projects.Where(x => x.Status == status.Value);
            }

            var skipAmount = (page - 1) * pageSize;

            return await projects.Skip(skipAmount).Take(pageSize).ToListAsync();
        }

        public async Task<Project?> GetByIdAsync(Guid id)
        {
            return await _dbcontext.Projects.FindAsync(id);
        }

        public async Task<Project> UpdateAsync(Project project)
        {
            await _dbcontext.SaveChangesAsync();
            return project;
        }
    }
}
