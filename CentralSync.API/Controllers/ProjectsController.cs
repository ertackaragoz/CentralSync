using Azure.Core;
using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] ProjectStatus? status = null)
        {
            var projectsDto = await _projectService.GetAllProjectsAsync(page, pageSize, status);
            return Ok(projectsDto);
        }

        [HttpGet("{projectId:guid}")]
        public async Task<IActionResult> GetProjectById([FromRoute] Guid projectId)
        {
            var projectDto = await _projectService.GetProjectByIdAsync(projectId);
            if (projectDto == null) return NotFound();

            return Ok(projectDto);
        }

        [HttpGet("{projectId:guid}/members")]
        public async Task<IActionResult> GetProjectMembers([FromRoute] Guid projectId, ProjectMemberRole? role)
        {
            var projectMembersDto = await _projectService.GetProjectMembersAsync(projectId, role);
            return Ok(projectMembersDto);
        }

        [Authorize(Roles = "Admin,ProjectManager")]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequestDto request)
        {
            var projectDto = await _projectService.CreateProjectAsync(request);
            return Ok(projectDto);
        }

        [HttpPost("{projectId:guid}/members")]
        public async Task<IActionResult> AddMemberToProject([FromRoute] Guid projectId, [FromBody] AddProjectMemberRequestDto request)
        {
            var projectMemberDto = await _projectService.AddMemberToProjectAsync(projectId, request);
            return Ok(projectMemberDto);
        }

        [HttpPut("{projectId:guid}")]
        public async Task<IActionResult> UpdateProject([FromRoute] Guid projectId, [FromBody] UpdateProjectRequestDto request)
        {
            var result = await _projectService.UpdateProjectAsync(projectId, request);
            if (result == false) return NotFound();
            return NoContent();
        }

        [HttpPatch("{projectId:guid}/archive")]
        public async Task<IActionResult> ArchiveProject([FromRoute] Guid projectId, [FromBody] ArchiveProjectRequestDto request)
        {
            var result = await _projectService.ArchiveProjectAsync(projectId, request);
            if (result == false) return NotFound();
            return NoContent();
        }

        [HttpDelete("{projectId:guid}")]
        public async Task<IActionResult> DeleteProject([FromRoute] Guid projectId)
        {
            var result = await _projectService.DeleteProjectAsync(projectId);
            if (result == false) return NotFound("Project not found");
            return NoContent();
        }
    }
}
