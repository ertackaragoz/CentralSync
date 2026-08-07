using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly CentralSyncDbContext _dbcontext;
        private readonly ICurrentUserService _currentUserService;

        public ProjectsController(CentralSyncDbContext dbcontext, ICurrentUserService currentUserService)
        {
            _dbcontext = dbcontext;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        public async Task<IActionResult> AddProject([FromBody] CreateProjectRequestDto project)
        {
            var projectDomainModel = new Project()
            {
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status,
                OwnerId = _currentUserService.UserId,
                IsArchived = false,
                IsDeleted = false,
            };

            await _dbcontext.AddAsync(projectDomainModel);
            await _dbcontext.SaveChangesAsync();

            var projectDto = new ProjectDto()
            {
                Id = projectDomainModel.Id,
                Name = projectDomainModel.Name,
                Description = projectDomainModel.Description,
                StartDate = projectDomainModel.StartDate,
                EndDate = projectDomainModel.EndDate,
                Status = projectDomainModel.Status,
                OwnerId = _currentUserService.UserId,
                IsArchived = projectDomainModel.IsArchived,
                ArchivedAt = projectDomainModel.ArchivedAt,
                CreatedAt = projectDomainModel.CreatedAt,
                UpdatedAt = projectDomainModel.UpdatedAt,
            };
            return Ok(projectDto);
        }

        [HttpPost("{projectId:guid}/members")]

        public async Task<IActionResult> AddMemberToProject([FromBody] AddProjectMemberRequestDto request, [FromRoute] Guid projectId)
        {
            var projectMemberDomain = new ProjectMember()
            {
                ProjectId = projectId,
                UserId = request.UserId,
                Role = request.Role,
                IsActive = true
            };

            await _dbcontext.ProjectMembers.AddAsync(projectMemberDomain);
            await _dbcontext.SaveChangesAsync();

            var projectMemberDto = new ProjectMemberDto()
            {
                Id = projectMemberDomain.Id,
                ProjectId = projectMemberDomain.ProjectId,
                UserId= projectMemberDomain.UserId,
                Role = projectMemberDomain.Role,
                IsActive = projectMemberDomain.IsActive,
                JoinedAt = projectMemberDomain.JoinedAt
            };
            return Ok(projectMemberDto);
        }
    }
}
