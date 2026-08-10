using Azure.Core;
using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
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
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public ProjectsController(IProjectRepository projectRepository, ICurrentUserService currentUserService)
        {
            _projectRepository = projectRepository;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] ProjectStatus? status = null)
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
            return Ok(projectsDto);
        }

        [HttpGet("{projectId:guid}")]
        public async Task<IActionResult> GetProject([FromRoute] Guid projectId)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return NotFound("Project not found"); }

            var projectDto = new ProjectDto()
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

            return Ok(projectDto);
        }

        [HttpPost]
        public async Task<IActionResult> AddProject([FromBody] CreateProjectRequestDto project)
        {
            if (DateTime.UtcNow > project.StartDate)
            {
                return BadRequest();
            }

            if (project.EndDate != null && DateTime.UtcNow > project.EndDate)
            {
                return BadRequest();
            }

            if (project.EndDate<project.StartDate)
            {
                return BadRequest();
            }

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

            await _projectRepository.AddProjectAsync(projectDomainModel);

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

        public async Task<IActionResult> AddMemberToProject([FromRoute] Guid projectId, [FromBody] AddProjectMemberRequestDto request)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return NotFound("Project not found"); }
            if (projectDomainModel.IsArchived) { return BadRequest("The project is archived."); }

            var projectMemberDomain = new ProjectMember()
            {
                ProjectId = projectId,
                UserId = request.UserId,
                Role = request.Role,
                IsActive = true
            };

            await _projectRepository.AddMemberToProjectAsync(projectMemberDomain);

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

        [HttpPut("{projectId:guid}")]
        public async Task<IActionResult> UpdateProject([FromRoute] Guid projectId, [FromBody] UpdateProjectRequestDto request)
        {
            if (DateTime.UtcNow > request.StartDate)
            {
                return BadRequest();
            }

            if (request.EndDate != null && DateTime.UtcNow > request.EndDate)
            {
                return BadRequest();
            }

            if (request.EndDate < request.StartDate)
            {
                return BadRequest();
            }

            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return NotFound("Project not found"); }
            if (projectDomainModel.IsArchived) { return BadRequest("The project is archived."); }

            if (projectDomainModel == null) { 
            return BadRequest();
            }

            projectDomainModel.Name  = request.Name;
            projectDomainModel.Description = request.Description;
            projectDomainModel.StartDate = request.StartDate;
            projectDomainModel.EndDate = request.EndDate;

            await _projectRepository.UpdateAsync(projectDomainModel);
            return Ok();
        }

        [HttpPatch("{projectId:guid}/archive")]
        public async Task<IActionResult> ArchiveProject([FromRoute] Guid projectId, [FromBody] ArchiveProjectRequestDto request)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null)
            {
                return NotFound();
            }

            projectDomainModel.IsArchived = request.IsArchived;
            projectDomainModel.ArchivedAt = request.IsArchived ? DateTime.UtcNow : null;

            await _projectRepository.UpdateAsync(projectDomainModel);

            return NoContent();
        }

        [HttpDelete("{projectId:guid}")]
        public async Task<IActionResult> DeleteProject([FromRoute] Guid projectId)
        {
            var projectDomainModel = await _projectRepository.GetByIdAsync(projectId);

            if (projectDomainModel == null) { return NotFound("Project not found"); }

            projectDomainModel.IsDeleted = true;

            await _projectRepository.UpdateAsync(projectDomainModel);

            return NoContent();
        }
    }
}
